import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';
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

    // Fetch Oxapay Settings
    const settings = await prisma.systemSetting.findUnique({
      where: { key: 'OXAPAY_MERCHANT_KEY' }
    });

    if (!settings || !settings.value) {
      return NextResponse.json({ error: 'Oxapay ayarları yapılandırılmamış.' }, { status: 500 });
    }

    const merchantKey = settings.value;

    // Generate Order ID
    const orderId = `OXA_${Date.now()}_${dbUser.id.substring(0,8)}`;

    const payload = {
      merchant: merchantKey,
      amount: amount,
      currency: "TRY",
      lifeTime: 30, // 30 minutes
      feePaidByPayer: 1, // User pays the network fee
      underPaidCover: 2.5,
      callbackUrl: `${process.env.NEXTAUTH_URL}/api/payment/oxapay/callback`,
      returnUrl: `${process.env.NEXTAUTH_URL}/balance?status=success`,
      description: "OnayTR Bakiye Yükleme",
      orderId: orderId,
      email: dbUser.email
    };

    const response = await fetch('https://api.oxapay.com/merchants/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.result === 100) {
      return NextResponse.json({ payLink: result.payLink });
    } else {
      console.error('Oxapay Error:', result.message);
      return NextResponse.json({ error: `Oxapay Hatası: ${result.message}` }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Oxapay Initiation Error:', error);
    return NextResponse.json({ error: 'Ödeme başlatılamadı.' }, { status: 500 });
  }
}
