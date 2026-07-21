import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { FiveSimProvider } from '@/lib/providers/5sim';
import { HeroSmsProvider } from '@/lib/providers/herosms';
import { OrderStatus } from '@prisma/client';
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

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { provider: true, user: true }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Security check
    if (order.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (order.status !== OrderStatus.PENDING) {
      return NextResponse.json({ error: 'Order is not active' }, { status: 400 });
    }

    // Call provider to request another SMS (status = 3)
    let providerSuccess = false;
    try {
      if (order.provider.name === 'herosms') {
        const heroSms = new HeroSmsProvider(order.provider.apiKey);
        providerSuccess = await heroSms.resendSms(order.providerOrderId);
      } else {
        // 5sim doesn't have a direct resend endpoint, they automatically keep receiving
        // but we return true to let the user reset state
        providerSuccess = true;
      }
    } catch (e: any) {
      console.error("Provider resend SMS failed:", e.message);
      return NextResponse.json({ error: `Sağlayıcı hatası: ${e.message}` }, { status: 502 });
    }

    // Reset local SMS code cache to wait for new SMS
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { smsCode: null } // Clear code to show SMS wait loader in UI again
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('Resend Order API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
