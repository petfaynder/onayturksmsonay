import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { FiveSimProvider } from '@/lib/providers/5sim';
import { HeroSmsProvider } from '@/lib/providers/herosms';
import { OrderStatus } from '@prisma/client';
import { getSystemSetting } from '@/lib/settings';
import { sendSmsNotification } from '@/lib/telegram';
import { processReferralCommission } from '@/lib/referral';
import { updateUserTierAndSpend } from '@/lib/tiers';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // 1. Find Order in our DB
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { provider: true, user: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Auth: Session-based (dashboard) with ownership check
    // V1 internal calls already verify ownership before calling this endpoint
    const session = await auth();
    if (session?.user?.email) {
      // Dashboard path: verify ownership
      if (order.user.email !== session.user.email) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      // No session — accept if caller passed the internal header (V1 routes set this)
      const internalKey = req.headers.get('x-internal-key');
      if (internalKey !== process.env.NEXTAUTH_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // If order is already completed or cancelled, return current status
    if (order.status !== OrderStatus.PENDING) {
      return NextResponse.json({ 
        status: order.status, 
        smsCode: order.smsCode 
      });
    }

    const now = new Date();

    // 2. Auto-expiry check:
    if (now > order.expiresAt) {
      let finalStatus: OrderStatus = OrderStatus.COMPLETED;
      
      if (!order.smsCode) {
        // No SMS code was ever received: Cancel and Auto-Refund
        finalStatus = OrderStatus.CANCELLED;
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: order.userId },
            data: { balance: { increment: order.sellPrice } }
          });
          await tx.transaction.create({
            data: {
              userId: order.userId,
              amount: order.sellPrice,
              type: 'REFUND',
              description: `İade (Zaman Aşımı): ${order.serviceCode} (${order.countryCode})`,
              referenceId: order.id
            }
          });
        });

        // Trigger cancel on provider in background
        try {
          if (order.provider.name === 'herosms') {
            const heroSms = new HeroSmsProvider(order.provider.apiKey);
            await heroSms.cancelOrder(order.providerOrderId);
          } else {
            const fiveSim = new FiveSimProvider(order.provider.apiKey);
            await fiveSim.cancelOrder(order.providerOrderId);
          }
        } catch (e) {
          console.error("Provider auto-cancel call failed on timeout:", e);
        }
      } else {
        // SMS code was received: Mark as COMPLETED and finish order on provider
        try {
          if (order.provider.name === 'herosms') {
            const heroSms = new HeroSmsProvider(order.provider.apiKey);
            await heroSms.finishOrder(order.providerOrderId);
          } else {
            const fiveSim = new FiveSimProvider(order.provider.apiKey);
            await fiveSim.finishOrder(order.providerOrderId);
          }
        } catch (e) {
          console.error("Provider auto-finish call failed on timeout:", e);
        }
      }

      // Save database status update
      await prisma.order.update({
        where: { id: order.id },
        data: { status: finalStatus }
      });

      if (finalStatus === OrderStatus.COMPLETED) {
        // Update user tier and spend
        await updateUserTierAndSpend(order.userId, order.sellPrice);

        try {
          await processReferralCommission(order.userId, order.id, order.sellPrice);
        } catch (refErr) {
          console.error("Referral commission error in auto-expiry COMPLETED:", refErr);
        }
      }

      return NextResponse.json({ 
        status: finalStatus, 
        smsCode: order.smsCode 
      });
    }

    // 3. Fetch live status from Provider
    let checkResponse: { status: string; smsCode: string | null } = { status: 'PENDING', smsCode: null };
    
    try {
      if (order.type === 'RENT' && order.provider.name === 'herosms') {
        // RENT orders: Use getRentStatus to get all SMS messages
        const heroSms = new HeroSmsProvider(order.provider.apiKey);
        const rentStatus = await heroSms.getRentStatus(order.providerOrderId);
        
        const mappedStatus = rentStatus.status === 'finish' ? 'CANCELLED' 
                           : rentStatus.status === 'cancel' ? 'CANCELLED' 
                           : 'PENDING';
        
        // Store all SMS messages as JSON array
        const smsMessages = rentStatus.smsMessages.map((msg: any) => ({
          text: msg.text || msg.message || '',
          sender: msg.phoneFrom || msg.sender || 'SMS',
          code: (msg.text || msg.message || '').match(/\d{4,8}/)?.[0] || '',
          date: msg.date || new Date().toISOString()
        }));
        
        checkResponse = {
          status: smsMessages.length > 0 ? 'RECEIVED' : mappedStatus,
          smsCode: smsMessages.length > 0 ? JSON.stringify(smsMessages) : order.smsCode
        };
      } else if (order.provider.name === 'herosms') {
        const heroSms = new HeroSmsProvider(order.provider.apiKey);
        const res = await heroSms.checkOrder(order.providerOrderId);
        checkResponse = {
          status: res.status === 'RECEIVED' ? 'RECEIVED' : res.status === 'CANCELED' ? 'CANCELLED' : 'PENDING',
          smsCode: res.smsCode
        };
      } else {
        const fiveSim = new FiveSimProvider(order.provider.apiKey);
        const res = await fiveSim.checkOrder(order.providerOrderId);
        
        const hasSms = res.sms && res.sms.length > 0;
        checkResponse = {
          status: res.status === 'RECEIVED' ? 'RECEIVED' : res.status === 'CANCELLED' ? 'CANCELLED' : 'PENDING',
          smsCode: hasSms ? res.sms[0].code : null
        };
      }
    } catch (err: any) {
      console.warn("Failed to check order status on provider API:", err.message);
      // Fail silently and return database status to avoid crashing client dashboard loop
      return NextResponse.json({ 
        status: order.status, 
        smsCode: order.smsCode 
      });
    }

    let updatedStatus: OrderStatus = order.status;
    let newSmsCode = order.smsCode;

    if (checkResponse.status === 'RECEIVED' && checkResponse.smsCode) {
      // We found a code! Update the smsCode field, but KEEP status as PENDING
      // so the user can request another code or click "Tamamla" in dashboard!
      newSmsCode = checkResponse.smsCode;
    } else if (checkResponse.status === 'CANCELLED') {
      // Canceled on provider side (timeout or admin cancel)
      updatedStatus = OrderStatus.CANCELLED;
      
      // Auto Refund logic
      if (!order.smsCode) {
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: order.userId },
            data: { balance: { increment: order.sellPrice } }
          });
          await tx.transaction.create({
            data: {
              userId: order.userId,
              amount: order.sellPrice,
              type: 'REFUND',
              description: `İptal İadesi (Sağlayıcı İptali): ${order.serviceCode} (${order.countryCode})`,
              referenceId: order.id
            }
          });
        });
      }
    }

    // 4. Update DB if anything changed
    if (updatedStatus !== order.status || newSmsCode !== order.smsCode) {
      await prisma.order.update({
        where: { id: order.id },
        data: { 
          status: updatedStatus,
          smsCode: newSmsCode
        }
      });

      // Webhook and Telegram SMS notification when code first received
      if (newSmsCode && !order.smsCode) {
        try {
          const userForWebhook = await prisma.user.findUnique({
            where: { id: order.userId },
            select: { telegramChatId: true, webhookUrl: true }
          });

          // Trigger Webhook if configured
          if (userForWebhook?.webhookUrl) {
            fetch(userForWebhook.webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: order.id,
                phoneNumber: order.phoneNumber,
                smsCode: newSmsCode,
                serviceCode: order.serviceCode,
                countryCode: order.countryCode,
                status: 'RECEIVED'
              }),
              signal: AbortSignal.timeout(5000)
            }).catch((err: any) => {
              console.error("Webhook notification delivery failed:", err.message);
            });
          }

          // Trigger Telegram if configured
          const botToken = await getSystemSetting('TELEGRAM_BOT_TOKEN');
          if (botToken && userForWebhook?.telegramChatId) {
            sendSmsNotification(botToken, userForWebhook.telegramChatId, order.phoneNumber, newSmsCode, order.serviceCode);
          }
        } catch (e) {
          console.error('Notifications trigger error:', e);
        }
      }
    }

    return NextResponse.json({ 
      status: updatedStatus,
      smsCode: newSmsCode
    });

  } catch (error: any) {
    console.error('Check API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
