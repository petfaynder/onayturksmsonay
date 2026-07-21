import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { HeroSmsProvider } from '@/lib/providers/herosms';
import { ECCEngine } from '@/lib/ecc';
import { SYSTEM_TO_HEROSMS_COUNTRY, HEROSMS_TO_SYSTEM_SERVICE } from '@/lib/utils/mappings';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

declare const globalThis: {
  cachedRentRawPrices: {
    results: { countryCode: string; data: any; success: boolean }[];
    exchangeRate: number;
  } | null;
  lastRentFetchTime: number;
} & typeof global;

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minute cache for raw data

export const RENT_DURATIONS = [
  { label: '1 Gün',   hours: 24  },
  { label: '3 Gün',   hours: 72  },
  { label: '1 Hafta', hours: 168 },
  { label: '2 Hafta', hours: 336 },
  { label: '1 Ay',    hours: 720 },
];

export async function GET() {
  try {
    const now = Date.now();

    if (globalThis.cachedRentRawPrices === undefined) {
      globalThis.cachedRentRawPrices = null;
      globalThis.lastRentFetchTime = 0;
    }

    let results: { countryCode: string; data: any; success: boolean }[] = [];
    let exchangeRate = 50.0;

    const cacheValid = globalThis.cachedRentRawPrices && (now - globalThis.lastRentFetchTime < CACHE_TTL_MS);

    if (cacheValid && globalThis.cachedRentRawPrices) {
      results = globalThis.cachedRentRawPrices.results;
      exchangeRate = globalThis.cachedRentRawPrices.exchangeRate;
    } else {
      // Get HeroSMS provider
      const provider = await prisma.apiProvider.findFirst({
        where: { name: 'herosms', isActive: true }
      });

      if (provider) {
        const heroSms = new HeroSmsProvider(provider.apiKey);
        const activeCountries = await prisma.country.findMany({ where: { isActive: true } });
        
        // Fetch in parallel for all mapped active countries
        const countriesToFetch = activeCountries.filter(c => SYSTEM_TO_HEROSMS_COUNTRY[c.providerCode.toLowerCase()] !== undefined);
        
        results = await Promise.all(
          countriesToFetch.map(async (c) => {
            const heroCountryId = SYSTEM_TO_HEROSMS_COUNTRY[c.providerCode.toLowerCase()];
            try {
              const rawData = await heroSms.getRentServicesAndCountries(24, heroCountryId);
              return { countryCode: c.providerCode, data: rawData, success: true };
            } catch (err: any) {
              console.warn(`Failed to fetch rent pricing for country ${c.providerCode}:`, err.message);
              return { countryCode: c.providerCode, success: false, data: null };
            }
          })
        );
        
        exchangeRate = await ECCEngine.getUsdToTryRate();

        globalThis.cachedRentRawPrices = {
          results,
          exchangeRate
        };
        globalThis.lastRentFetchTime = now;
      }
    }

    // Resolve current user's specific tier margin
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

    const activeCountries = await prisma.country.findMany({ where: { isActive: true } });
    const activeServices = await prisma.service.findMany({ where: { isActive: true } });

    const activeCountryMap = new Map(activeCountries.map(c => [c.providerCode, c]));
    const activeServiceMap = new Map(activeServices.map(s => [s.providerCode, s]));

    const appsMap = new Map<string, { count: number; minPrice: number }>();
    const countriesMap = new Map<string, any>();
    const formattedData: any = {};

    // Process results with ECC margins scaled for user
    for (const res of results) {
      if (!res.success || !res.data || !res.data.services) continue;
      
      const countryCode = res.countryCode;
      const dbCountry = activeCountryMap.get(countryCode);
      if (!dbCountry) continue;

      formattedData[countryCode] = {};
      let countryTotalCount = 0;
      let countryMinPrice = Infinity;

      for (const [heroServiceCode, serviceData] of Object.entries(res.data.services as Record<string, any>)) {
        if (typeof serviceData !== 'object' || !serviceData) continue;

        const systemServiceCode = HEROSMS_TO_SYSTEM_SERVICE[heroServiceCode] || heroServiceCode;
        const dbService = activeServiceMap.get(systemServiceCode);
        if (!dbService) continue;

        const count = Number(serviceData.quantity) || 0;
        const costUsd = Number(serviceData.price) || 0;

        if (costUsd > 0 && count > 0) {
          const baseMargin = (dbService as any).marginRent ?? dbService.margin5sim ?? (dbCountry as any).marginRent ?? dbCountry.margin5sim ?? globalMargin;
          const marginToUse = getMarginForUser(baseMargin);
          
          const costTry = costUsd * exchangeRate;
          const sellTry = costTry * (1 + (marginToUse / 100));
          const finalPrice = Number(sellTry.toFixed(2));

          const ops: any = {};
          
          // Add "any" operator
          ops['any'] = {
            count,
            costUsd,
            basePriceTry: finalPrice, // Price for 24h (base period)
            priceTry: finalPrice // Daily price (total price = dailyPrice * days)
          };

          // Also map specific operators
          if (res.data.operators && typeof res.data.operators === 'object') {
            const operatorKeys = Object.keys(res.data.operators);
            const operatorCount = operatorKeys.length;
            for (const opName of Object.values(res.data.operators)) {
              if (opName && opName !== 'any') {
                ops[opName as string] = {
                  count: Math.ceil(count / operatorCount),
                  costUsd,
                  basePriceTry: finalPrice,
                  priceTry: finalPrice
                };
              }
            }
          }

          formattedData[countryCode][systemServiceCode] = {
            operators: ops,
            minPrice: finalPrice,
            totalCount: count,
          };

          countryTotalCount += count;
          if (finalPrice < countryMinPrice) countryMinPrice = finalPrice;

          const existing = appsMap.get(systemServiceCode);
          appsMap.set(systemServiceCode, existing
            ? { count: existing.count + count, minPrice: Math.min(existing.minPrice, finalPrice) }
            : { count: count, minPrice: finalPrice }
          );
        }
      }

      if (countryTotalCount > 0) {
        countriesMap.set(countryCode, {
          code: countryCode,
          name: dbCountry.name,
          flagCode: dbCountry.flagCode || 'tr',
          minPrice: countryMinPrice === Infinity ? 0 : countryMinPrice,
          totalCount: countryTotalCount,
        });
      }
    }

    const serviceSortOrder = new Map(activeServices.map(s => [s.providerCode, s.sortOrder]));
    const appsList = Array.from(appsMap.entries()).map(([name, data]) => ({
      name,
      displayName: activeServiceMap.get(name)?.name || name,
      ...data
    })).sort((a, b) => {
      const orderA = serviceSortOrder.get(a.name) ?? 9999;
      const orderB = serviceSortOrder.get(b.name) ?? 9999;
      if (orderA !== orderB) return orderA - orderB;
      return b.count - a.count;
    });

    const countriesList = Array.from(countriesMap.values())
      .sort((a, b) => a.name.localeCompare(b.name, 'tr'));

    const result = {
      apps: appsList,
      countries: countriesList,
      prices: formattedData,
      durations: RENT_DURATIONS,
      provider: 'herosms',
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error: any) {
    console.error('Rent Pricing API Error:', error);
    return NextResponse.json({ error: 'Fiyatlar alınamadı: ' + error.message }, { status: 500 });
  }
}
