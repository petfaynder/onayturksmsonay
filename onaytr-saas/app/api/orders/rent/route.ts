import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { HeroSmsProvider } from '@/lib/providers/herosms';
import { ECCEngine } from '@/lib/ecc';
import { OrderStatus, TransactionType } from '@prisma/client';
import { auth } from '@/auth';
import { SYSTEM_TO_HEROSMS_COUNTRY, SYSTEM_TO_HEROSMS_SERVICE } from '@/lib/utils/mappings';

export async function POST(req: Request) {
  try {
    // Auth: Verify the user session
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { country, operator, product, hours = 24 } = body;
    // country: country code (e.g. "russia", "england" or numeric ID)
    // operator: "any" or specific operator
    // product: service code (e.g. "whatsapp", "telegram")
    // hours: one of 24, 72, 168, 336, 720

    if (!country || !product) {
      return NextResponse.json({ error: 'Eksik alanlar: country, product gereklidir.' }, { status: 400 });
    }

    // Validate duration
    const VALID_DURATIONS = [4, 12, 24, 72, 168, 336, 720, 1440, 2160, 4320];
    if (!VALID_DURATIONS.includes(Number(hours))) {
      return NextResponse.json({ error: `Geçersiz süre. Desteklenen: ${VALID_DURATIONS.join(', ')} saat.` }, { status: 400 });
    }

    // 1. Fetch User from session (don't trust body userId)
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });

    // 2. Fetch HeroSMS Provider
    const provider = await prisma.apiProvider.findFirst({
      where: { name: 'herosms', isActive: true }
    });
    if (!provider) return NextResponse.json({ error: 'HeroSMS sağlayıcısı aktif değil.' }, { status: 400 });

    const heroSms = new HeroSmsProvider(provider.apiKey);

    // Map country name to HeroSMS country ID (number)
    const heroCountryId = SYSTEM_TO_HEROSMS_COUNTRY[country.toLowerCase()];
    if (heroCountryId === undefined) {
      return NextResponse.json({ error: 'Bu ülke için kiralama desteklenmiyor.' }, { status: 400 });
    }

    // Map system service code to HeroSMS service code
    const heroServiceCode = SYSTEM_TO_HEROSMS_SERVICE[product.toLowerCase()] || product;

    // 3. Get current price from HeroSMS (24h base price, then multiply by period)
    let operatorData: any = null;
    try {
      const rentData = await heroSms.getRentServicesAndCountries(24, heroCountryId);
      
      const serviceData = rentData?.services?.[heroServiceCode];
      if (!serviceData) throw new Error('Servis bu ülkede mevcut değil');

      operatorData = {
        cost: serviceData.price || serviceData.cost || 0,
        count: serviceData.quantity || serviceData.count || 0
      };
    } catch (err: any) {
      return NextResponse.json({ error: `Fiyat alınamadı: ${err.message}` }, { status: 400 });
    }

    const baseCostUsd = Number(operatorData.cost) || 0;
    if (baseCostUsd <= 0) {
      return NextResponse.json({ error: 'Geçersiz fiyat verisi' }, { status: 400 });
    }

    // Price for selected duration (base is 24h)
    const dayMultiplier = Number(hours) / 24;
    const totalCostUsd = baseCostUsd * dayMultiplier;

    // 4. ECC: Calculate Sell Price with marginRent
    const dbCountry = await prisma.country.findFirst({ where: { providerCode: country } });
    const dbService = await prisma.service.findFirst({ where: { providerCode: product } });
    const globalMargin = await ECCEngine.getGlobalMargin();
    const marginToUse = (dbService as any)?.marginRent ?? dbService?.margin5sim ?? (dbCountry as any)?.marginRent ?? dbCountry?.margin5sim ?? globalMargin;

    const { costPriceTry, sellPriceTry } = await ECCEngine.calculateSellPrice(totalCostUsd, marginToUse);

    // 5. Balance Check
    if (user.balance < sellPriceTry) {
      return NextResponse.json({
        error: `Yetersiz bakiye. Gereken: ₺${sellPriceTry.toFixed(2)}, Mevcut: ₺${user.balance.toFixed(2)}`
      }, { status: 400 });
    }

    // 6. DB Transaction: Deduct Balance
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { balance: { decrement: sellPriceTry } }
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: -sellPriceTry,
          type: TransactionType.PURCHASE,
          description: `Kiralık Numara: ${product.toUpperCase()} (${country}) - ${hours}s`
        }
      });
    });

    // 7. Call HeroSMS to Rent Number (Use correct mapped country ID and service code)
    let rentResponse: { id: string; phone: string };
    try {
      rentResponse = await heroSms.getRentNumber(heroCountryId, operator || 'any', heroServiceCode, Number(hours));
    } catch (error: any) {
      // Rollback balance
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: user.id },
          data: { balance: { increment: sellPriceTry } }
        });
        await tx.transaction.create({
          data: {
            userId: user.id,
            amount: sellPriceTry,
            type: TransactionType.REFUND,
            description: `İade (Kiralama API Hatası): ${product} (${country})`
          }
        });
      });

      const rawMsg = error.message || 'Bilinmeyen hata';
      let userMsg = 'Seçtiğiniz servise ait kiralık numaralar şu anda yoğunluk nedeniyle tahsis edilemiyor. Lütfen birkaç dakika sonra tekrar deneyin veya alternatif olarak başka bir ülke seçin.';
      if (rawMsg.includes('no free phones') || rawMsg.includes('NO_NUMBERS') || rawMsg.includes('count')) {
        userMsg = 'Bu ülke/servis için şu an kiralık numara stoku bulunmuyor. Lütfen daha sonra tekrar deneyin veya farklı bir ülke seçin.';
      } else if (rawMsg.includes('NO_BALANCE') || rawMsg.includes('balance')) {
        userMsg = 'Seçtiğiniz özelliklerde numara şu anda sistem yoğunluğu nedeniyle tahsis edilemiyor. Lütfen biraz sonra tekrar deneyin.';
      }

      return NextResponse.json({ error: userMsg }, { status: 502 });
    }

    // 8. Save Order to DB
    const expiresAt = new Date(Date.now() + Number(hours) * 60 * 60 * 1000);

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        providerId: provider.id,
        providerOrderId: rentResponse.id.toString(),
        serviceCode: product,
        countryCode: country,
        operatorCode: operator || 'any',
        phoneNumber: rentResponse.phone,
        costPrice: costPriceTry,
        sellPrice: sellPriceTry,
        status: OrderStatus.PENDING,
        type: 'RENT',
        expiresAt: expiresAt
      }
    });

    return NextResponse.json({
      success: true,
      order,
      expiresAt: expiresAt.toISOString(),
      phone: rentResponse.phone,
      hours: Number(hours)
    });

  } catch (error: any) {
    console.error('Rent Order API Error:', error);
    return NextResponse.json({ error: 'Kiralama işlemi gerçekleştirilemedi: ' + error.message }, { status: 500 });
  }
}
