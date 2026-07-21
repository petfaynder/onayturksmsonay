import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { FiveSimProvider } from '@/lib/providers/5sim';
import { HeroSmsProvider } from '@/lib/providers/herosms';
import { ECCEngine } from '@/lib/ecc';
import { OrderStatus, TransactionType } from '@prisma/client';
import { SYSTEM_TO_HEROSMS_COUNTRY, SYSTEM_TO_HEROSMS_SERVICE } from '@/lib/utils/mappings';
import { auth } from '@/auth';

interface PriceLine {
  provider: '5sim' | 'herosms';
  operator: string;
  count: number;
  costUsd: number;
  priceTry: number;
  profitTry: number;
  providerDbId: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // operatorKey format: "provider__operatorName" e.g. "herosms__any" or "5sim__virtual21"
    const { userId: bodyUserId, country, product, operatorKey } = body;

    if (!country || !product) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Auth: Session-based (dashboard) or userId from body (V1 internal calls)
    let user;
    const session = await auth();
    if (session?.user?.email) {
      // Dashboard path: use session
      user = await prisma.user.findUnique({ where: { email: session.user.email } });
    } else if (bodyUserId) {
      // V1 internal path: verify internal key before trusting bodyUserId
      const internalKey = req.headers.get('x-internal-key');
      if (internalKey !== process.env.NEXTAUTH_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      user = await prisma.user.findUnique({ where: { id: bodyUserId } });
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // 2. Fetch Active Providers
    const providers = await prisma.apiProvider.findMany({ where: { isActive: true } });
    const fiveSimDb = providers.find(p => p.name === '5sim');
    const heroSmsDb = providers.find(p => p.name === 'herosms');

    if (providers.length === 0) {
      return NextResponse.json({ error: 'Aktif servis sağlayıcı bulunamadı.' }, { status: 400 });
    }

    // 3. Fetch specific country/service configurations & exchange rates
    const dbService = await prisma.service.findFirst({ where: { providerCode: product, isActive: true } });
    const dbCountry = await prisma.country.findFirst({ where: { providerCode: country, isActive: true } });

    if (!dbService || !dbCountry) {
      return NextResponse.json({ error: 'Seçilen servis veya ülke şu anda aktif değil.' }, { status: 400 });
    }

    const exchangeRate = await ECCEngine.getUsdToTryRate();
    const globalMargin = await ECCEngine.getGlobalMargin();

    // Fetch manual override settings
    const forceProviderSetting = await prisma.systemSetting.findFirst({
      where: { key: 'FORCE_PROVIDER' }
    });
    const forceProvider = forceProviderSetting?.value || 'auto'; // 'auto' | '5sim' | 'herosms'

    // 4. Fetch Live Prices for this specific country and product
    let rawPrices5sim: any = {};
    let rawPricesHerosms: any = {};

    const fetchPromises: Promise<any>[] = [];

    if (fiveSimDb) {
      fetchPromises.push(
        (async () => {
          try {
            const fiveSim = new FiveSimProvider(fiveSimDb.apiKey);
            rawPrices5sim = await fiveSim.getPrices(country, product);
          } catch (err: any) {
            console.error('5sim pricing fetch failed for buy route:', err.message);
          }
        })()
      );
    }

    const heroCountryId = SYSTEM_TO_HEROSMS_COUNTRY[country];
    const heroServiceCode = SYSTEM_TO_HEROSMS_SERVICE[product];
    if (heroSmsDb && heroCountryId !== undefined && heroServiceCode) {
      fetchPromises.push(
        (async () => {
          try {
            const heroSms = new HeroSmsProvider(heroSmsDb.apiKey);
            rawPricesHerosms = await heroSms.getPrices(heroCountryId, heroServiceCode);
          } catch (err: any) {
            console.error('HeroSMS pricing fetch failed for buy route:', err.message);
          }
        })()
      );
    }

    await Promise.all(fetchPromises);

    // 5. Compile Available Lines with VIP Tier discounts
    const lines: PriceLine[] = [];
    const userTierDiscount = await ECCEngine.getTierDiscount(user.role, user.tierLevel);

    // --- 5SIM LINE ---
    const countryData5sim = rawPrices5sim[country]?.[product];
    if (fiveSimDb && countryData5sim) {
      for (const [operator, data] of Object.entries(countryData5sim as Record<string, any>)) {
        if (data && typeof data.count === 'number' && data.count > 0 && typeof data.cost === 'number') {
          const baseMargin = dbService.margin5sim ?? dbCountry.margin5sim ?? globalMargin;
          const costTry = data.cost * exchangeRate;
          const sellTry = ECCEngine.calculateFinalPrice(costTry, baseMargin, userTierDiscount);
          const profitTry = sellTry - costTry;

          lines.push({
            provider: '5sim',
            operator,
            count: data.count,
            costUsd: data.cost,
            priceTry: sellTry,
            profitTry,
            providerDbId: fiveSimDb.id
          });
        }
      }
    }

    // --- HEROSMS LINE ---
    if (heroSmsDb && rawPricesHerosms[heroCountryId]?.[heroServiceCode]) {
      const heroProduct = rawPricesHerosms[heroCountryId][heroServiceCode];
      const processHeroItem = (op: string, cost: number, count: number) => {
        const baseMargin = dbService.marginHerosms ?? dbCountry.marginHerosms ?? globalMargin;
        const costTry = cost * exchangeRate;
        const sellTry = ECCEngine.calculateFinalPrice(costTry, baseMargin, userTierDiscount);
        const profitTry = sellTry - costTry;

        lines.push({
          provider: 'herosms',
          operator: op,
          count,
          costUsd: cost,
          priceTry: sellTry,
          profitTry,
          providerDbId: heroSmsDb.id
        });
      };

      if (typeof heroProduct.cost === 'number' && typeof heroProduct.count === 'number') {
        processHeroItem('any', heroProduct.cost, heroProduct.count);
      } else {
        for (const [op, opData] of Object.entries(heroProduct)) {
          if (opData && typeof opData === 'object') {
            const cost = (opData as any).cost ?? (opData as any).price;
            const count = (opData as any).count ?? (opData as any).qty ?? (opData as any).count;
            if (typeof cost === 'number' && typeof count === 'number') {
              processHeroItem(op, cost, count);
            }
          } else if (typeof opData === 'number') {
            processHeroItem(op, opData, 99);
          }
        }
      }
    }

    let activeLines = lines.filter(l => l.count > 0);
    if (forceProvider === '5sim') {
      activeLines = activeLines.filter(l => l.provider === '5sim');
    } else if (forceProvider === 'herosms') {
      activeLines = activeLines.filter(l => l.provider === 'herosms');
    }

    // 6. Apply Auto-Block for Banned Numbers (Telemetry check)
    // Filter out lines that have had > 50% cancellation rate in last 10 minutes (minimum 3 attempts)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentLogs = await prisma.providerHealthLog.findMany({
      where: {
        countryCode: country,
        serviceCode: product,
        createdAt: { gte: tenMinutesAgo }
      }
    });

    const isLineBlocked = (provider: string, operator: string): boolean => {
      const lineLogs = recentLogs.filter(l => l.providerName === provider && l.operatorCode === operator);
      if (lineLogs.length < 3) return false;
      const failures = lineLogs.filter(l => !l.isSuccess).length;
      return (failures / lineLogs.length) >= 0.50; // Block if failure rate is >= 50%
    };

    activeLines = activeLines.filter(l => !isLineBlocked(l.provider, l.operator));

    if (activeLines.length === 0) {
      return NextResponse.json({
        error: 'Seçtiğiniz servise ait numaralar şu anda sağlayıcı hatlarındaki yoğunluk nedeniyle tahsis edilemedi. Lütfen birkaç dakika sonra tekrar deneyin veya alternatif olarak başka bir ülkeyi seçiniz.'
      }, { status: 502 });
    }

    // 7. Pin the user's chosen line as primary, sort rest cheapest-first as fallbacks
    // operatorKey format: "provider__operatorName"
    let primaryLine: PriceLine;
    let fallbackLines: PriceLine[];

    if (operatorKey) {
      const [chosenProvider, chosenOperator] = operatorKey.split('__');
      const chosen = activeLines.find(l => l.provider === chosenProvider && l.operator === chosenOperator);
      if (!chosen) {
        return NextResponse.json({ error: 'Seçilen hat artık mevcut değil. Lütfen başka bir seçenek deneyin.' }, { status: 400 });
      }
      primaryLine = chosen;
      // Fallbacks: other lines sorted cheapest-first (will only be used if chosen fails)
      fallbackLines = activeLines.filter(l => !(l.provider === chosenProvider && l.operator === chosenOperator)).sort((a, b) => a.priceTry - b.priceTry);
    } else {
      // No specific selection: use cheapest as primary
      activeLines.sort((a, b) => a.priceTry - b.priceTry);
      primaryLine = activeLines[0];
      fallbackLines = activeLines.slice(1);
    }

    const orderedLines = [primaryLine, ...fallbackLines];
    const initialPriceCharged = Number(primaryLine.priceTry.toFixed(2));

    // 8. Initial Balance Check
    if (user.balance < initialPriceCharged) {
      return NextResponse.json({ error: 'Yetersiz bakiye' }, { status: 400 });
    }

    // 9. Deduct initial balance BEFORE trying APIs to prevent duplicate/free exploits
    const dbTransactionResult = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: initialPriceCharged } }
      });

      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          amount: -initialPriceCharged,
          type: TransactionType.PURCHASE,
          description: `Numara Satın Alma Girişimi: ${product} (${country})`
        }
      });

      return { updatedUser, transaction };
    });

    // 10. Purchase Attempt Loop
    let success = false;
    let purchasedNum: any = null;
    let finalLineUsed: PriceLine | null = null;
    let failureReason = 'Bilinmeyen sağlayıcı hatası';

    for (const line of orderedLines) {
      // If this backup option is more expensive than what we displayed/charged:
      if (line.priceTry > primaryLine.priceTry) {
        // Skip if user does not allow auto-fallback pricing increase or doesn't have the balance
        if (!user.autoFallback || user.balance < (line.priceTry - primaryLine.priceTry)) {
          continue;
        }
      }

      try {
        if (line.provider === '5sim') {
          const fiveSim = new FiveSimProvider(fiveSimDb!.apiKey);
          purchasedNum = await fiveSim.buyNumber(country, line.operator, product);
        } else {
          const heroSms = new HeroSmsProvider(heroSmsDb!.apiKey);
          const heroCountryId = SYSTEM_TO_HEROSMS_COUNTRY[country];
          const heroServiceCode = SYSTEM_TO_HEROSMS_SERVICE[product];
          purchasedNum = await heroSms.buyNumber(heroCountryId, heroServiceCode);
        }

        success = true;
        finalLineUsed = line;
        break;
      } catch (err: any) {
        console.error(`Buy route attempt failed for ${line.provider}/${line.operator}:`, err.message);
        failureReason = err.message || failureReason;

        // Log failure telemetry
        await prisma.providerHealthLog.create({
          data: {
            providerName: line.provider,
            countryCode: country,
            serviceCode: product,
            operatorCode: line.operator,
            isSuccess: false,
            errorType: err.message.includes('no free phones') ? 'no_free_phones' : 'timeout'
          }
        });
      }
    }

    // 11. Process Results
    if (success && finalLineUsed && purchasedNum) {
      const finalPrice = Number(finalLineUsed.priceTry.toFixed(2));
      const difference = initialPriceCharged - finalPrice;

      // Log success telemetry
      await prisma.providerHealthLog.create({
        data: {
          providerName: finalLineUsed.provider,
          countryCode: country,
          serviceCode: product,
          operatorCode: finalLineUsed.operator,
          isSuccess: true
        }
      });

      // Handle balance differences
      let balanceUpdated = user.balance - initialPriceCharged;

      if (difference > 0) {
        // Fallback option was CHEAPER! Refund the difference
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: user.id },
            data: { balance: { increment: difference } }
          });
          await tx.transaction.create({
            data: {
              userId: user.id,
              amount: difference,
              type: TransactionType.REFUND,
              description: `İade (Alternatif Hat Farkı): ${product} (${country})`
            }
          });
        });
        balanceUpdated += difference;
      } else if (difference < 0) {
        // Fallback option was MORE EXPENSIVE (and allowed by toggle)! Deduct additional amount
        const additionalCharge = Math.abs(difference);
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: user.id },
            data: { balance: { decrement: additionalCharge } }
          });
          await tx.transaction.create({
            data: {
              userId: user.id,
              amount: -additionalCharge,
              type: TransactionType.PURCHASE,
              description: `Ek Ücret (Alternatif Hat Farkı): ${product} (${country})`
            }
          });
        });
        balanceUpdated -= additionalCharge;
      }

      // Save Order to Database
      // expiresAt is always 20 minutes from now — provider expiry can be days-long which
      // prevents auto-refund from ever firing if the user navigates away from the dashboard.
      const EXPIRY_MS = 20 * 60 * 1000; // 20 minutes
      const newOrder = await prisma.order.create({
        data: {
          userId: user.id,
          providerId: finalLineUsed.providerDbId,
          providerOrderId: purchasedNum.id.toString(),
          serviceCode: product,
          countryCode: country,
          operatorCode: finalLineUsed.operator,
          phoneNumber: purchasedNum.phone,
          costPrice: finalLineUsed.costUsd * exchangeRate,
          sellPrice: finalPrice,
          status: OrderStatus.PENDING,
          expiresAt: new Date(Date.now() + EXPIRY_MS)
        }
      });


      // Update the initial transaction reference
      await prisma.transaction.update({
        where: { id: dbTransactionResult.transaction.id },
        data: { referenceId: newOrder.id }
      });

      // Track recent services (keep last 20 per user)
      try {
        const existing = await prisma.userRecentService.findFirst({
          where: { userId: user.id, serviceCode: product, countryCode: country },
        });
        if (existing) {
          await prisma.userRecentService.update({ where: { id: existing.id }, data: { usedAt: new Date() } });
        } else {
          await prisma.userRecentService.create({ data: { userId: user.id, serviceCode: product, countryCode: country } });
          // Prune to 20 most recent
          const allRecents = await prisma.userRecentService.findMany({
            where: { userId: user.id }, orderBy: { usedAt: 'asc' },
          });
          if (allRecents.length > 20) {
            const toDelete = allRecents.slice(0, allRecents.length - 20);
            await prisma.userRecentService.deleteMany({ where: { id: { in: toDelete.map(r => r.id) } } });
          }
        }
      } catch (e) { /* non-critical */ }

      return NextResponse.json({
        success: true,
        order: newOrder,
        refundAmount: difference > 0 ? difference : 0,
        extraChargeAmount: difference < 0 ? Math.abs(difference) : 0,
        newBalance: balanceUpdated
      });

    } else {
      // FAILURE: Refund the full charged price
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { balance: { increment: initialPriceCharged } }
        });
        await tx.transaction.create({
          data: {
            userId: user.id,
            amount: initialPriceCharged,
            type: TransactionType.REFUND,
            description: `İade (Başarısız Alım): ${product} (${country})`
          }
        });
      });

      let errorMsg = 'Seçtiğiniz servise ait numaralar şu anda sağlayıcı hatlarındaki yoğunluk nedeniyle tahsis edilemedi. Lütfen birkaç dakika sonra tekrar deneyin veya alternatif olarak başka bir ülkeyi seçiniz.';
      if (failureReason.includes('not enough user balance')) {
        errorMsg = 'Sağlayıcı bakiyesinde yetersizlik var. Lütfen yöneticiye bildirin.';
      }

      return NextResponse.json({ error: errorMsg }, { status: 502 });
    }

  } catch (error: any) {
    console.error('Buy API Error:', error);
    return NextResponse.json({ error: 'Dahili sunucu hatası', details: error.message }, { status: 500 });
  }
}
