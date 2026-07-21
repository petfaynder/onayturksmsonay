import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { FiveSimProvider } from '@/lib/providers/5sim';
import { HeroSmsProvider } from '@/lib/providers/herosms';
import { OrderStatus, TransactionType } from '@prisma/client';

import { auth } from '@/auth';

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

    // 1. Find Order in our DB
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { provider: true, user: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Security check: Only the owner can cancel the order
    if (order.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Can only cancel pending orders
    if (order.status !== OrderStatus.PENDING) {
      return NextResponse.json({ error: 'Only pending orders can be cancelled' }, { status: 400 });
    }

    // Enforce 3-minute cancellation limit
    const elapsedMs = Date.now() - new Date(order.createdAt).getTime();
    const threeMinutesMs = 3 * 60 * 1000;
    if (elapsedMs < threeMinutesMs) {
      const remainingSeconds = Math.ceil((threeMinutesMs - elapsedMs) / 1000);
      const remainingMin = Math.floor(remainingSeconds / 60);
      const remainingSec = remainingSeconds % 60;
      return NextResponse.json({ 
        error: `Bu numarayı iptal etmek için satın alma işleminden sonra en az 3 dakika geçmesi gerekmektedir. Kalan süre: ${remainingMin}:${remainingSec < 10 ? '0' : ''}${remainingSec}` 
      }, { status: 400 });
    }

    // 2. Call provider to cancel (supports both 5sim and HeroSMS)
    try {
      if (order.provider.name === 'herosms') {
        const heroSms = new HeroSmsProvider(order.provider.apiKey);
        await heroSms.cancelOrder(order.providerOrderId);
      } else {
        const fiveSim = new FiveSimProvider(order.provider.apiKey);
        await fiveSim.cancelOrder(order.providerOrderId);
      }
    } catch (error) {
      // Sometimes it's already cancelled on provider side, we should still refund the user if so.
      console.error('Provider Cancel Error:', error);
    }

    // 3. Update DB and Refund (Transaction)
    let newBalance = 0;
    await prisma.$transaction(async (tx) => {
      // Mark order cancelled
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED }
      });

      // Refund user
      const updatedUser = await tx.user.update({
        where: { id: order.userId },
        data: { balance: { increment: order.sellPrice } }
      });
      newBalance = parseFloat(updatedUser.balance.toString());

      // Log refund
      await tx.transaction.create({
        data: {
          userId: order.userId,
          amount: order.sellPrice,
          type: TransactionType.REFUND,
          description: `Kullanıcı İptali: ${order.serviceCode} (${order.countryCode})`,
          referenceId: order.id
        }
      });
    });

    return NextResponse.json({ success: true, message: 'Order cancelled and refunded.', newBalance, refundAmount: order.sellPrice });

  } catch (error: any) {
    console.error('Cancel API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
