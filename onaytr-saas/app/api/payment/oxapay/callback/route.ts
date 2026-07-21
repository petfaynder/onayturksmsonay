import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const hmacHeader = req.headers.get('hmac');

    if (!hmacHeader) {
      return new NextResponse('Missing HMAC', { status: 400 });
    }

    // Fetch Oxapay Settings
    const settings = await prisma.systemSetting.findUnique({
      where: { key: 'OXAPAY_MERCHANT_KEY' }
    });

    if (!settings || !settings.value) {
      return new NextResponse('Oxapay not configured', { status: 500 });
    }

    const merchantKey = settings.value;

    // Verify HMAC
    const expectedHmac = crypto.createHmac('sha512', merchantKey).update(rawBody).digest('hex');

    if (hmacHeader !== expectedHmac) {
      console.error('Oxapay Webhook Hash Mismatch');
      return new NextResponse('Invalid HMAC', { status: 400 });
    }

    const data = JSON.parse(rawBody);

    // Oxapay IPN Data
    const { status, orderId, payAmount, type } = data;
    // status can be 'Paid', 'Expired', 'Waiting', etc.

    if (status === 'Paid') {
      // Find user id from orderId (OXA_TIMESTAMP_USERID)
      const parts = orderId.split('_');
      if (parts.length >= 3) {
        const userIdPrefix = parts[2];
        
        const users = await prisma.user.findMany({
          where: { id: { startsWith: userIdPrefix } },
          take: 1
        });

        const user = users[0];
        
        if (user) {
          const existingTx = await prisma.transaction.findFirst({
            where: { referenceId: orderId, type: 'DEPOSIT' }
          });

          if (!existingTx) {
            // Note: payAmount in Oxapay might be in the target currency (e.g., USDT) or base currency (TRY). 
            // In our request, we asked for currency: "TRY". So payAmount should be TRY.
            const amount = parseFloat(payAmount);
            
            if (amount > 0) {
              await prisma.$transaction([
                prisma.user.update({
                  where: { id: user.id },
                  data: { balance: { increment: amount } }
                }),
                prisma.transaction.create({
                  data: {
                    userId: user.id,
                    amount: amount,
                    type: 'DEPOSIT',
                    description: `Kripto Bakiye Yükleme (${type || 'Oxapay'})`,
                    referenceId: orderId
                  }
                })
              ]);
              console.log(`Oxapay Deposit Success: +${amount} TL for User: ${user.email}`);
            }
          }
        }
      }
    }

    return NextResponse.json({ message: 'OK' });

  } catch (error: any) {
    console.error('Oxapay Webhook Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
