import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { FiveSimProvider } from '@/lib/providers/5sim';
import { HeroSmsProvider } from '@/lib/providers/herosms';
import { ECCEngine } from '@/lib/ecc';
import { SYSTEM_TO_HEROSMS_COUNTRY, SYSTEM_TO_HEROSMS_SERVICE } from '@/lib/utils/mappings';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

declare const globalThis: {
  cachedRawPrices: {
    fiveSim: any;
    heroSms: any;
    exchangeRate: number;
  } | null;
  lastFetchTime: number;
} & typeof global;

const CACHE_TTL_MS = 60 * 1000; // 1 minute cache for raw provider calls

interface PriceLine {
  provider: '5sim' | 'herosms';
  operator: string;
  count: number;
  costUsd: number;
  priceTry: number;
  profitTry: number;
}

export async function GET() {
  try {
    const now = Date.now();
    
    // Initialize global cache variables if they don't exist
    if (globalThis.cachedRawPrices === undefined) {
      globalThis.cachedRawPrices = null;
      globalThis.lastFetchTime = 0;
    }

    // 1. Fetch raw prices (either from global raw cache or live APIs)
    let rawPrices5sim: any = {};
    let rawPricesHerosms: any = {};
    let exchangeRate = 50.0;

    const cacheValid = globalThis.cachedRawPrices && (now - globalThis.lastFetchTime < CACHE_TTL_MS);

    if (cacheValid && globalThis.cachedRawPrices) {
      rawPrices5sim = globalThis.cachedRawPrices.fiveSim;
      rawPricesHerosms = globalThis.cachedRawPrices.heroSms;
      exchangeRate = globalThis.cachedRawPrices.exchangeRate;
    } else {
      // Get Active Providers
      const providers = await prisma.apiProvider.findMany({
        where: { isActive: true }
      });

      const fiveSimDb = providers.find(p => p.name === '5sim');
      const heroSmsDb = providers.find(p => p.name === 'herosms');

      const fetchPromises: Promise<any>[] = [];

      if (fiveSimDb) {
        fetchPromises.push(
          (async () => {
            try {
              const fiveSim = new FiveSimProvider(fiveSimDb.apiKey);
              rawPrices5sim = await fiveSim.getPrices();
            } catch (err: any) {
              console.error('5sim pricing fetch failed:', err.message);
            }
          })()
        );
      }

      if (heroSmsDb) {
        fetchPromises.push(
          (async () => {
            try {
              const heroSms = new HeroSmsProvider(heroSmsDb.apiKey);
              rawPricesHerosms = await heroSms.getPrices();
            } catch (err: any) {
              console.error('HeroSMS pricing fetch failed:', err.message);
            }
          })()
        );
      }

      await Promise.all(fetchPromises);
      exchangeRate = await ECCEngine.getUsdToTryRate();

      // Save to global raw cache
      globalThis.cachedRawPrices = {
        fiveSim: rawPrices5sim,
        heroSms: rawPricesHerosms,
        exchangeRate
      };
      globalThis.lastFetchTime = now;
    }

    // 2. Resolve current user's specific tier margin
    const session = await auth();
    let userTier = 'BRONZE';
    let userRole = 'USER';

    if (session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true, tierLevel: true }
      });
      if (dbUser) {
        userTier = dbUser.tierLevel;
        userRole = dbUser.role;
      }
    }

    const globalMargin = await ECCEngine.getGlobalMargin();
    const userMarginOverride = await ECCEngine.getTierMargin(userRole, userTier);

    // Scaling factor helper for user tier discounts
    const getMarginForUser = (baseMargin: number) => {
      if (userMarginOverride < globalMargin && globalMargin > 0) {
        return +(baseMargin * (userMarginOverride / globalMargin)).toFixed(2);
      }
      return baseMargin;
    };

    // 3. Process through ECC Engine and Filter by Active DB Settings
    const forceProviderSetting = await prisma.systemSetting.findFirst({
      where: { key: 'FORCE_PROVIDER' }
    });
    const forceProvider = forceProviderSetting?.value || 'auto'; // 'auto' | '5sim' | 'herosms'
    
    // Fetch active countries and services from DB
    const activeCountries = await prisma.country.findMany({ where: { isActive: true } });
    const activeServices = await prisma.service.findMany({ where: { isActive: true } });

    // Build fast lookup maps
    const activeCountryMap = new Map(activeCountries.map(c => [c.providerCode, c]));
    const activeServiceMap = new Map(activeServices.map(s => [s.providerCode, s]));

    const appsMap = new Map<string, { count: number, minPrice: number }>();
    const countriesMap = new Map<string, any>();
    const formattedData: any = {};

    // Helper to extract prices safely from HeroSMS response
    const parseHeroSmsProduct = (heroCountryId: number, heroServiceCode: string): { operator: string, cost: number, count: number }[] => {
      const countryData = rawPricesHerosms[heroCountryId];
      if (!countryData) return [];
      const serviceData = countryData[heroServiceCode];
      if (!serviceData) return [];

      const results: { operator: string, cost: number, count: number }[] = [];

      if (typeof serviceData.cost === 'number' && typeof serviceData.count === 'number') {
        results.push({ operator: 'any', cost: serviceData.cost, count: serviceData.count });
      } else {
        // If it is grouped by operator (like virtual34, etc.)
        for (const [op, opData] of Object.entries(serviceData)) {
          if (opData && typeof opData === 'object') {
            const cost = (opData as any).cost ?? (opData as any).price;
            const count = (opData as any).count ?? (opData as any).qty ?? (opData as any).count;
            if (typeof cost === 'number' && typeof count === 'number') {
              results.push({ operator: op, cost, count });
            }
          } else if (typeof opData === 'number') {
            results.push({ operator: op, cost: opData, count: 99 });
          }
        }
      }
      return results;
    };

    // Fetch Providers keys just to verify they exist in this dynamic block
    const activeProviders = await prisma.apiProvider.findMany({
      where: { isActive: true }
    });
    const has5sim = activeProviders.some(p => p.name === '5sim');
    const hasHeroSms = activeProviders.some(p => p.name === 'herosms');

    // Build combined lists
    for (const dbCountry of activeCountries) {
      const countryCode = dbCountry.providerCode; // e.g. "russia"
      formattedData[countryCode] = {};

      let countryTotalCount = 0;
      let countryMinPrice = Infinity;
      let countryMaxPrice = 0;

      for (const dbService of activeServices) {
        const serviceCode = dbService.providerCode; // e.g. "whatsapp"
        const lines: PriceLine[] = [];

        // --- 5SIM LINE PROCESSING ---
        if (has5sim && rawPrices5sim[countryCode]?.[serviceCode]) {
          const operators5sim = rawPrices5sim[countryCode][serviceCode];
          for (const [operator, data] of Object.entries(operators5sim as Record<string, any>)) {
            if (data && typeof data.count === 'number' && data.count > 0 && typeof data.cost === 'number') {
              const baseMargin = dbService.margin5sim ?? dbCountry.margin5sim ?? globalMargin;
              const margin = getMarginForUser(baseMargin);
              
              const costTry = data.cost * exchangeRate;
              const sellTry = costTry * (1 + (margin / 100));
              const profitTry = sellTry - costTry;

              lines.push({
                provider: '5sim',
                operator,
                count: data.count,
                costUsd: data.cost,
                priceTry: sellTry,
                profitTry
              });
            }
          }
        }

        // --- HEROSMS LINE PROCESSING ---
        const heroCountryId = SYSTEM_TO_HEROSMS_COUNTRY[countryCode];
        const heroServiceCode = SYSTEM_TO_HEROSMS_SERVICE[serviceCode];
        if (hasHeroSms && heroCountryId !== undefined && heroServiceCode) {
          const heroOperators = parseHeroSmsProduct(heroCountryId, heroServiceCode);
          for (const op of heroOperators) {
            if (op.count > 0) {
              const baseMargin = dbService.marginHerosms ?? dbCountry.marginHerosms ?? globalMargin;
              const margin = getMarginForUser(baseMargin);

              const costTry = op.cost * exchangeRate;
              const sellTry = costTry * (1 + (margin / 100));
              const profitTry = sellTry - costTry;

              lines.push({
                provider: 'herosms',
                operator: op.operator,
                count: op.count,
                costUsd: op.cost,
                priceTry: sellTry,
                profitTry
              });
            }
          }
        }

        // Filter and compile
        let activeLines = lines.filter(l => l.count > 0);
        if (forceProvider === '5sim') {
          activeLines = activeLines.filter(l => l.provider === '5sim');
        } else if (forceProvider === 'herosms') {
          activeLines = activeLines.filter(l => l.provider === 'herosms');
        }

        if (activeLines.length === 0) continue;

        // Sort by price ascending (cheapest first) so UI shows best deals first
        activeLines.sort((a, b) => a.priceTry - b.priceTry);

        const totalProductCount = activeLines.reduce((acc, curr) => acc + curr.count, 0);
        const cheapestLine = activeLines[0];
        const minPrice = Number(cheapestLine.priceTry.toFixed(2));

        // Build operators map: each line gets its own entry, keyed by provider+operator
        const operatorsMap: Record<string, { count: number; costUsd: number; priceTry: number; provider: string; operator: string }> = {};
        for (const line of activeLines) {
          const key = `${line.provider}__${line.operator}`;
          operatorsMap[key] = {
            count: line.count,
            costUsd: line.costUsd,
            priceTry: Number(line.priceTry.toFixed(2)),
            provider: line.provider,
            operator: line.operator
          };
        }

        // Return all operators (all price tiers) sorted cheapest-first
        formattedData[countryCode][serviceCode] = {
          operators: operatorsMap,
          minPrice,
          totalCount: totalProductCount,
          lines: activeLines // saved for backend fallback purchasing
        };

        // Update country stats
        countryTotalCount += totalProductCount;
        if (minPrice < countryMinPrice) countryMinPrice = minPrice;
        if (minPrice > countryMaxPrice) countryMaxPrice = minPrice;

        // Update global Apps stats
        const existingApp = appsMap.get(serviceCode) || { count: 0, minPrice: Infinity };
        appsMap.set(serviceCode, {
          count: existingApp.count + totalProductCount,
          minPrice: Math.min(existingApp.minPrice, minPrice)
        });
      }

      if (countryTotalCount > 0) {
        countriesMap.set(countryCode, {
          name: dbCountry.name,
          code: countryCode,
          count: countryTotalCount,
          minPrice: countryMinPrice,
          maxPrice: countryMaxPrice
        });
      }
    }

    const serviceSortOrder = new Map(activeServices.map(s => [s.providerCode, s.sortOrder]));

    const result = {
      exchangeRate,
      globalMargin: userMarginOverride, // return the resolved tier margin to the user client
      apps: Array.from(appsMap.entries()).map(([name, data]) => ({ name, ...data })).sort((a, b) => {
        const orderA = serviceSortOrder.get(a.name) ?? 9999;
        const orderB = serviceSortOrder.get(b.name) ?? 9999;
        if (orderA !== orderB) return orderA - orderB;
        return b.count - a.count;
      }),
      countries: Array.from(countriesMap.values()).sort((a, b) => b.count - a.count).slice(0, 250),
      detailedPricing: formattedData
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error: any) {
    console.error('Pricing API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch pricing' }, { status: 500 });
  }
}
