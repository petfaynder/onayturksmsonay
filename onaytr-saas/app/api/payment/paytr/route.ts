import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';
import crypto from 'crypto';
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

    // Fetch PayTR Settings
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ['PAYTR_MERCHANT_ID', 'PAYTR_MERCHANT_KEY', 'PAYTR_MERCHANT_SALT', 'PAYTR_TEST_MODE'] } }
    });

    const config = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    if (!config.PAYTR_MERCHANT_ID || !config.PAYTR_MERCHANT_KEY || !config.PAYTR_MERCHANT_SALT) {
      return NextResponse.json({ error: 'PayTR ayarları yapılandırılmamış.' }, { status: 500 });
    }

    // Generate Merchant OID
    const merchant_oid = `PAYTR_${Date.now()}_${dbUser.id}`;
    
    // Amount must be multiplied by 100 for PayTR
    const payment_amount = Math.round(amount * 100).toString();

    // User details
    const user_ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const email = dbUser.email;
    const user_name = 'OnayTR User';
    const user_address = 'OnayTR Digital Services';
    const user_phone = '05555555555';

    // Basket
    const user_basket = JSON.stringify([['Bakiye Yukleme', amount.toString(), 1]]);

    const merchant_ok_url = `${process.env.NEXTAUTH_URL}/balance?status=success`;
    const merchant_fail_url = `${process.env.NEXTAUTH_URL}/balance?status=fail`;
    
    const debug_on = '1';
    const no_installment = '1';
    const max_installment = '0';
    const currency = 'TL';
    const test_mode = config.PAYTR_TEST_MODE || '0'; // Default to production; set to '1' via admin settings for testing

    // Hash Calculation
    // hash_str = merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode
    const hash_str = config.PAYTR_MERCHANT_ID + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode;
    const paytr_token = crypto.createHmac('sha256', config.PAYTR_MERCHANT_KEY)
      .update(hash_str + config.PAYTR_MERCHANT_SALT)
      .digest('base64');

    const formData = new URLSearchParams();
    formData.append('merchant_id', config.PAYTR_MERCHANT_ID);
    formData.append('user_ip', user_ip);
    formData.append('merchant_oid', merchant_oid);
    formData.append('email', email);
    formData.append('payment_amount', payment_amount);
    formData.append('paytr_token', paytr_token);
    formData.append('user_basket', user_basket);
    formData.append('debug_on', debug_on);
    formData.append('no_installment', no_installment);
    formData.append('max_installment', max_installment);
    formData.append('user_name', user_name);
    formData.append('user_address', user_address);
    formData.append('user_phone', user_phone);
    formData.append('merchant_ok_url', merchant_ok_url);
    formData.append('merchant_fail_url', merchant_fail_url);
    formData.append('timeout_limit', '30');
    formData.append('currency', currency);
    formData.append('test_mode', test_mode);

    const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const result = await response.json();

    if (result.status === 'success') {
      return NextResponse.json({ token: result.token });
    } else {
      console.error('PayTR Token Error:', result.reason);
      return NextResponse.json({ error: `PayTR Hatası: ${result.reason}` }, { status: 500 });
    }

  } catch (error: any) {
    console.error('PayTR Initiation Error:', error);
    return NextResponse.json({ error: 'Ödeme başlatılamadı.' }, { status: 500 });
  }
}
