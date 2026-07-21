import cron from 'node-cron';
import prisma from '@/lib/db';
import { FiveSimProvider } from '@/lib/providers/5sim';
import { HeroSmsProvider } from '@/lib/providers/herosms';
import { OrderStatus } from '@prisma/client';
import { processReferralCommission } from '@/lib/referral';

let isRunning = false;

async function expireOrders() {
  // Prevent overlapping runs
  if (isRunning) {
    console.log('[expire-cron] Skipping — previous run still in progress.');
    return;
  }
  isRunning = true;

  try {
    const now = new Date();

    const expiredOrders = await prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING,
        expiresAt: { lte: now },
      },
      include: { provider: true },
    });

    if (expiredOrders.length === 0) {
      isRunning = false;
      return;
    }

    console.log(`[expire-cron] Processing ${expiredOrders.length} expired order(s)...`);

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

          // Cancel on provider (best-effort)
          try {
            if (order.provider.name === 'herosms') {
              const hero = new HeroSmsProvider(order.provider.apiKey);
              await hero.cancelOrder(order.providerOrderId);
            } else {
              const five = new FiveSimProvider(order.provider.apiKey);
              await five.cancelOrder(order.providerOrderId);
            }
          } catch (provErr) {
            console.error(`[expire-cron] Provider cancel failed for ${order.id}:`, provErr);
          }

          console.log(`[expire-cron] Cancelled & refunded order ${order.id} (${order.serviceCode}/${order.countryCode}) — ${order.sellPrice} TRY`);
        } else {
          // SMS was received → Complete the order
          await prisma.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.COMPLETED },
          });

          // Finish on provider (best-effort)
          try {
            if (order.provider.name === 'herosms') {
              const hero = new HeroSmsProvider(order.provider.apiKey);
              await hero.finishOrder(order.providerOrderId);
            } else {
              const five = new FiveSimProvider(order.provider.apiKey);
              await five.finishOrder(order.providerOrderId);
            }
          } catch (provErr) {
            console.error(`[expire-cron] Provider finish failed for ${order.id}:`, provErr);
          }

          // Referral commission
          try {
            await processReferralCommission(order.userId, order.id, order.sellPrice);
          } catch (refErr) {
            console.error(`[expire-cron] Referral error for ${order.id}:`, refErr);
          }

          console.log(`[expire-cron] Completed order ${order.id} (${order.serviceCode}/${order.countryCode})`);
        }
      } catch (orderErr) {
        console.error(`[expire-cron] Error processing order ${order.id}:`, orderErr);
      }
    }
  } catch (err) {
    console.error('[expire-cron] Fatal error:', err);
  } finally {
    isRunning = false;
  }
}

let cronStarted = false;

export function startExpiryCron() {
  if (cronStarted) return;
  cronStarted = true;

  // Run every 5 minutes
  cron.schedule('*/5 * * * *', expireOrders, {
    name: 'expire-orders',
  });

  // Cleanup old ProviderHealthLog entries every hour (keep only last 24h)
  cron.schedule('0 * * * *', async () => {
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const result = await prisma.providerHealthLog.deleteMany({
        where: { createdAt: { lt: cutoff } }
      });
      if (result.count > 0) {
        console.log(`[health-cleanup] Deleted ${result.count} old ProviderHealthLog entries.`);
      }
    } catch (err) {
      console.error('[health-cleanup] Error:', err);
    }
  }, {
    name: 'health-log-cleanup',
  });

  // Also run immediately on startup to clear any backlog from downtime
  expireOrders();

  console.log('[expire-cron] Scheduled — runs every 5 minutes (and immediately on startup).');
  console.log('[health-cleanup] Scheduled — runs every hour.');
}
