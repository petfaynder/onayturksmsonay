import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import crypto from 'crypto';
import { TransactionType } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const random_nr = formData.get('random_nr') as string;
    const platform_order_id = formData.get('platform_order_id') as string;
    const total_order_value = formData.get('total_order_value') as string;
    const currency = formData.get('currency') as string;
    const signature = formData.get('signature') as string;

    if (!random_nr || !platform_order_id || !total_order_value || !currency || !signature) {
      return new Response('SHOPIER: Missing parameters', { status: 400 });
    }

    // Fetch Shopier Settings
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: ['SHOPIER_API_SECRET'] } }
    });

    const config = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    if (!config.SHOPIER_API_SECRET) {
      return new Response('SHOPIER: Config missing', { status: 500 });
    }

    // Signature Verification
    // data = random_nr + platform_order_id + total_order_value + currency
    const data = random_nr + platform_order_id + total_order_value + currency;
    
    const receivedBuffer = Buffer.from(signature, 'base64');
    const expectedBuffer = crypto.createHmac('sha256', config.SHOPIER_API_SECRET)
      .update(data)
      .digest();

    let isSignatureValid = false;
    if (receivedBuffer.length === expectedBuffer.length) {
      isSignatureValid = crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
    }

    if (!isSignatureValid) {
      // Fallback direct base64 comparison
      const expectedBase64 = expectedBuffer.toString('base64');
      if (signature !== expectedBase64) {
        return new Response('SHOPIER: Invalid signature', { status: 400 });
      }
    }

    // Extract User ID from platform_order_id (Format: SHOP_timestamp_userId)
    const parts = platform_order_id.split('_');
    const userId = parts[parts.length - 1];

    if (!userId) {
      return new Response('SHOPIER: User ID not found', { status: 400 });
    }

    // Prevent Double Processing
    const existingTx = await prisma.transaction.findFirst({
      where: { referenceId: platform_order_id }
    });

    if (existingTx) {
      return new Response('OK');
    }

    const depositAmount = parseFloat(total_order_value);

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
          description: `Shopier Bakiye Yükleme`,
          referenceId: platform_order_id
        }
      });
    });

    console.log(`[Shopier Callback] Successfully deposited ${depositAmount} TRY to User ${userId}`);
    return new Response('OK');

  } catch (error) {
    console.error('[Shopier Callback Error]:', error);
    return new Response('SHOPIER: Internal Server Error', { status: 500 });
  }
}
