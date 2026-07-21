import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { auth } from '@/auth';
import { FiveSimProvider } from '@/lib/providers/5sim';
import { HeroSmsProvider } from '@/lib/providers/herosms';
import { ECCEngine } from '@/lib/ecc';
import AdminServiceDetailClient from '@/components/AdminServiceDetailClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SYSTEM_TO_HEROSMS_COUNTRY, SYSTEM_TO_HEROSMS_SERVICE } from '@/lib/utils/mappings';

export const dynamic = 'force-dynamic';

export default async function AdminServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!dbUser || dbUser.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const resolvedParams = await params;
  const service = await prisma.service.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!service) {
    notFound();
  }

  // 1. Fetch Providers
  const providers = await prisma.apiProvider.findMany({
    where: { isActive: true }
  });

  const fiveSimDb = providers.find(p => p.name === '5sim');
  const heroSmsDb = providers.find(p => p.name === 'herosms');

  // 2. Fetch all active countries in our database
  const activeCountries = await prisma.country.findMany({
    where: { isActive: true }
  });
  const countryMap = new Map(activeCountries.map(c => [c.providerCode, c]));

  // 3. Fetch current exchange rate and global margin
  const exchangeRate = await ECCEngine.getUsdToTryRate();
  const globalMargin = await ECCEngine.getGlobalMargin();

  // 4. Fetch live prices from both providers in parallel
  let rawPrices5sim: any = {};
  let rawPricesHerosms: any = {};

  const fetchPromises: Promise<any>[] = [];

  if (fiveSimDb) {
    fetchPromises.push(
      (async () => {
        try {
          const fiveSim = new FiveSimProvider(fiveSimDb.apiKey);
          rawPrices5sim = await fiveSim.getPrices();
        } catch (error) {
          console.error('Failed to fetch 5sim prices for details:', error);
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
        } catch (error) {
          console.error('Failed to fetch HeroSMS prices for details:', error);
        }
      })()
    );
  }

  await Promise.all(fetchPromises);

  // 5. Compile stats per country and provider
  const countryPricingList: any[] = [];
  let totalStock = 0;

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

  // Compile 5sim pricing
  if (fiveSimDb) {
    for (const [countryCode, products] of Object.entries(rawPrices5sim)) {
      const dbCountry = countryMap.get(countryCode);
      if (!dbCountry) continue;

      const productData = (products as any)[service.providerCode];
      if (!productData) continue;

      for (const [operator, data] of Object.entries(productData as Record<string, any>)) {
        if (!data || typeof data.count !== 'number' || data.count <= 0) continue;
        if (typeof data.cost !== 'number') continue;

        const marginToUse = service.margin5sim ?? dbCountry.margin5sim ?? globalMargin;
        const costUsd = data.cost;
        const costTry = costUsd * exchangeRate;
        const sellTry = costTry * (1 + (marginToUse / 100));
        const profitTry = sellTry - costTry;

        totalStock += data.count;

        countryPricingList.push({
          provider: '5sim',
          countryCode,
          countryName: dbCountry.name,
          operator,
          costUsd,
          costTry,
          sellTry,
          profitTry,
          count: data.count,
          marginApplied: marginToUse
        });
      }
    }
  }

  // Compile HeroSMS pricing
  if (heroSmsDb) {
    const heroServiceCode = SYSTEM_TO_HEROSMS_SERVICE[service.providerCode];
    if (heroServiceCode) {
      for (const dbCountry of activeCountries) {
        const countryCode = dbCountry.providerCode;
        const heroCountryId = SYSTEM_TO_HEROSMS_COUNTRY[countryCode];
        if (heroCountryId === undefined) continue;

        const heroOperators = parseHeroSmsProduct(heroCountryId, heroServiceCode);
        for (const op of heroOperators) {
          if (op.count <= 0) continue;

          const marginToUse = service.marginHerosms ?? dbCountry.marginHerosms ?? globalMargin;
          const costUsd = op.cost;
          const costTry = costUsd * exchangeRate;
          const sellTry = costTry * (1 + (marginToUse / 100));
          const profitTry = sellTry - costTry;

          totalStock += op.count;

          countryPricingList.push({
            provider: 'herosms',
            countryCode,
            countryName: dbCountry.name,
            operator: op.operator,
            costUsd,
            costTry,
            sellTry,
            profitTry,
            count: op.count,
            marginApplied: marginToUse
          });
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link 
          href="/admin/services"
          className="p-2 bg-white/60 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-800 display-font">{service.name} Detayları & İstatistikleri</h1>
          <p className="text-slate-500 mt-1">
            Kod: <span className="font-mono">{service.providerCode}</span> • Çoklu Sağlayıcı Modu
          </p>
        </div>
      </div>

      <AdminServiceDetailClient 
        service={service as any}
        pricingList={countryPricingList}
        totalStock={totalStock}
        exchangeRate={exchangeRate}
      />
    </div>
  );
}
