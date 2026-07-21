import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { FiveSimProvider } from '@/lib/providers/5sim';
import { HeroSmsProvider } from '@/lib/providers/herosms';
import { OrderStatus } from '@prisma/client';
import { auth } from '@/auth';
import { processReferralCommission } from '@/lib/referral';
import { updateUserTierAndSpend } from '@/lib/tiers';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { provider: true, user: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Security check: Only the owner or an admin can finish the order
    if (order.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (order.status !== OrderStatus.PENDING) {
      return NextResponse.json({ error: 'Order is not in pending state' }, { status: 400 });
    }

    // Call provider to finish activation
    try {
      if (order.provider.name === 'herosms') {
        const heroSms = new HeroSmsProvider(order.provider.apiKey);
        await heroSms.finishOrder(order.providerOrderId);
      } else {
        const fiveSim = new FiveSimProvider(order.provider.apiKey);
        await fiveSim.finishOrder(order.providerOrderId);
      }
    } catch (e: any) {
      console.error("Provider finish activation failed:", e.message);
      // We still proceed to update our local DB since the client finished it
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.COMPLETED }
    });

    // Update monthly spend and tier Level
    await updateUserTierAndSpend(order.userId, order.sellPrice);

    // Process referral commission
    try {
      await processReferralCommission(order.userId, order.id, order.sellPrice);
    } catch (refErr) {
      console.error("Referral commission error in finish order:", refErr);
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('Finish Order API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
