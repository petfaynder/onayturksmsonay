import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import crypto from 'crypto';
import { TransactionType } from '@prisma/client';
import { sendWebhookNotification } from '@/lib/webhook';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const merchant_oid = formData.get('merchant_oid') as string;
    const status = formData.get('status') as string;
    const total_amount = formData.get('total_amount') as string; // e.g. "1000" for 10.00 TL
    const hash = formData.get('hash') as string;

    if (!merchant_oid || !status || !total_amount || !hash) {
      return new Response('PAYTR: Missing parameters', { status: 400 });
    }

    // Fetch PayTR Settings
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ['PAYTR_MERCHANT_KEY', 'PAYTR_MERCHANT_SALT'] } }
    });

    const config = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    if (!config.PAYTR_MERCHANT_KEY || !config.PAYTR_MERCHANT_SALT) {
      return new Response('PAYTR: Config missing', { status: 500 });
    }

    // Hash Verification
    // paytr_token = base64(hmac_sha256(merchant_oid + merchant_salt + status + total_amount, merchant_key))
    const hash_str = merchant_oid + config.PAYTR_MERCHANT_SALT + status + total_amount;
    const expected_hash = crypto.createHmac('sha256', config.PAYTR_MERCHANT_KEY)
      .update(hash_str)
      .digest('base64');

    if (hash !== expected_hash) {
      return new Response('PAYTR: Invalid signature', { status: 400 });
    }

    // Extract User ID from merchant_oid (Format: PAYTR_TIMESTAMP_USERID)
    const oidParts = merchant_oid.split('_');
    const userId = oidParts[oidParts.length - 1];

    if (!userId) {
      return new Response('PAYTR: User ID not found in OID', { status: 400 });
    }

    // Prevent Double Processing
    const existingTx = await prisma.transaction.findFirst({
      where: { referenceId: merchant_oid }
    });

    if (existingTx) {
      return new Response('OK'); // Already processed, reply OK to stop retries
    }

    if (status === 'success') {
      const depositAmount = parseFloat(total_amount) / 100; // total_amount is in cents

      await prisma.$transaction(async (tx) => {
        // 1. Update user balance
        await tx.user.update({
          where: { id: userId },
          data: { balance: { increment: depositAmount } }
        });

        // 2. Create Transaction Log
        await tx.transaction.create({
          data: {
            userId: userId,
            amount: depositAmount,
            type: TransactionType.DEPOSIT,
            description: `PayTR Bakiye Yükleme`,
            referenceId: merchant_oid
          }
        });
      });

      console.log(`[PayTR Callback] Successfully deposited ${depositAmount} TRY to User ${userId}`);

      // Trigger Webhook Notification in background
      (async () => {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true }
        });
        await sendWebhookNotification("Yeni Bakiye Yükleme", `Başarılı bakiye yüklemesi gerçekleşti.\n👤 Kullanıcı: ${user?.email || userId}\n💳 Tutar: ${depositAmount} ₺\n📦 Yöntem: PayTR\n🔢 İşlem No: ${merchant_oid}`);
      })().catch(err => console.error("PayTR Webhook error:", err));
    } else {
      console.log(`[PayTR Callback] Payment failed for OID: ${merchant_oid}`);
    }

    // PayTR expects EXACTLY "OK" response to confirm receipt
    return new Response('OK');

  } catch (error) {
    console.error('[PayTR Callback Error]:', error);
    return new Response('PAYTR: Internal Server Error', { status: 500 });
  }
}
