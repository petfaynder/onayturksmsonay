import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { FiveSimProvider } from '@/lib/providers/5sim';
import { HeroSmsProvider } from '@/lib/providers/herosms';
import { OrderStatus } from '@prisma/client';
import { processReferralCommission } from '@/lib/referral';

// This endpoint is called by Vercel Cron or any external scheduler.
// It scans for PENDING orders that have passed their expiresAt timestamp
// and finalises them: refund if no SMS was received, or complete if one was.
//
// Secure it with a secret header or CRON_SECRET env variable.
// Vercel Cron invocations automatically include the Authorization header.

export async function GET(req: Request) {
  // --- Authorization ---
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const now = new Date();

  // Find all orders that are still PENDING but past their expiry time
  const expiredOrders = await prisma.order.findMany({
    where: {
      status: OrderStatus.PENDING,
      expiresAt: { lte: now },
    },
    include: { provider: true },
  });

  if (expiredOrders.length === 0) {
    return NextResponse.json({ processed: 0, message: 'No expired orders found.' });
  }

  let cancelled = 0;
  let completed = 0;
  const errors: string[] = [];

  for (const order of expiredOrders) {
    try {
      if (!order.smsCode) {
        // No SMS received → Cancel and refund
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.CANCELLED },
          });

          await tx.user.update({
            where: { id: order.userId },
            data: { balance: { increment: order.sellPrice } },
          });

          await tx.transaction.create({
            data: {
              userId: order.userId,
              amount: order.sellPrice,
              type: 'REFUND',
              description: `Otomatik İade (Zaman Aşımı): ${order.serviceCode} (${order.countryCode})`,
              referenceId: order.id,
            },
          });
        });

        // Cancel on provider side (best-effort)
        try {
          if (order.provider.name === 'herosms') {
            const heroSms = new HeroSmsProvider(order.provider.apiKey);
            await heroSms.cancelOrder(order.providerOrderId);
          } else {
            const fiveSim = new FiveSimProvider(order.provider.apiKey);
            await fiveSim.cancelOrder(order.providerOrderId);
          }
        } catch (providerErr) {
          console.error(`[expire-cron] Provider cancel failed for order ${order.id}:`, providerErr);
        }

        cancelled++;
      } else {
        // SMS received → Mark as completed
        await prisma.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.COMPLETED },
        });

        // Finish on provider side (best-effort)
        try {
          if (order.provider.name === 'herosms') {
            const heroSms = new HeroSmsProvider(order.provider.apiKey);
            await heroSms.finishOrder(order.providerOrderId);
          } else {
            const fiveSim = new FiveSimProvider(order.provider.apiKey);
            await fiveSim.finishOrder(order.providerOrderId);
          }
        } catch (providerErr) {
          console.error(`[expire-cron] Provider finish failed for order ${order.id}:`, providerErr);
        }

        // Process referral commission
        try {
          await processReferralCommission(order.userId, order.id, order.sellPrice);
        } catch (refErr) {
          console.error(`[expire-cron] Referral commission error for order ${order.id}:`, refErr);
        }

        completed++;
      }
    } catch (err) {
      console.error(`[expire-cron] Failed to process order ${order.id}:`, err);
      errors.push(order.id);
    }
  }

  console.log(`[expire-cron] Done. Cancelled: ${cancelled}, Completed: ${completed}, Errors: ${errors.length}`);

  return NextResponse.json({
    processed: expiredOrders.length,
    cancelled,
    completed,
    errors,
  });
}
