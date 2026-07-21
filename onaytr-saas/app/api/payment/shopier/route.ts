import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';
import { Shopier } from 'shopier-api';
import { getSystemSetting } from '@/lib/settings';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { amount } = body;

    // Get dynamic minimum deposit limit
    const minDepositSetting = await getSystemSetting('MIN_DEPOSIT_LIMIT', '10');
    const minDeposit = parseFloat(minDepositSetting) || 10;

    if (!amount || amount < minDeposit) {
      return NextResponse.json({ error: `Minimum yükleme tutarı ${minDeposit} TL.` }, { status: 400 });
    }

    // Fetch Shopier Settings
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ['SHOPIER_API_KEY', 'SHOPIER_API_SECRET'] } }
    });

    const config = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    if (!config.SHOPIER_API_KEY || !config.SHOPIER_API_SECRET) {
      return NextResponse.json({ error: 'Shopier ayarları yapılandırılmamış.' }, { status: 500 });
    }

    // Generate Order ID
    const order_id = `SHOP_${Date.now()}_${dbUser.id.substring(0,8)}`;

    const shopier = new Shopier(config.SHOPIER_API_KEY, config.SHOPIER_API_SECRET);

    shopier.setBuyer({
      buyer_id_nr: dbUser.id,
      platform_order_id: order_id,
      product_name: 'Bakiye Yukleme',
      buyer_name: 'OnayTR',
      buyer_surname: 'User',
      buyer_email: dbUser.email,
      buyer_phone: '05555555555'
    });

    shopier.setOrderBilling({
      billing_address: 'OnayTR Digital Services',
      billing_city: 'Istanbul',
      billing_country: 'Türkiye',
      billing_postcode: '34000'
    });

    shopier.setOrderShipping({
      shipping_address: 'OnayTR Digital Services',
      shipping_city: 'Istanbul',
      shipping_country: 'Türkiye',
      shipping_postcode: '34000'
    });

    // Generate HTML form for redirect
    const paymentPageHtml = shopier.generatePaymentHTML(amount);

    return NextResponse.json({ html: paymentPageHtml });

  } catch (error: any) {
    console.error('Shopier Initiation Error:', error);
    return NextResponse.json({ error: 'Ödeme başlatılamadı.' }, { status: 500 });
  }
}
