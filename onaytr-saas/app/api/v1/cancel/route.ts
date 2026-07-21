import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/apiAuth";
import prisma from "@/lib/db";
import { FiveSimProvider } from "@/lib/providers/5sim";
import { HeroSmsProvider } from "@/lib/providers/herosms";
import { OrderStatus, TransactionType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await authenticateApiRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    // 1. Fetch Order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { provider: true }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden (You do not own this order)" }, { status: 403 });
    }

    if (order.status !== OrderStatus.PENDING) {
      return NextResponse.json({ error: "Only pending orders can be cancelled" }, { status: 400 });
    }

    // Enforce 3-minute cancel limit
    const elapsedMs = Date.now() - new Date(order.createdAt).getTime();
    const threeMinutesMs = 3 * 60 * 1000;
    if (elapsedMs < threeMinutesMs) {
      const remainingSeconds = Math.ceil((threeMinutesMs - elapsedMs) / 1000);
      return NextResponse.json({
        error: `Bu numarayı iptal etmek için satın alma işleminden sonra en az 3 dakika geçmesi gerekmektedir. Kalan süre: ${remainingSeconds} saniye.`
      }, { status: 400 });
    }

    // 2. Call provider cancel
    try {
      if (order.provider.name === "herosms") {
        const heroSms = new HeroSmsProvider(order.provider.apiKey);
        await heroSms.cancelOrder(order.providerOrderId);
      } else {
        const fiveSim = new FiveSimProvider(order.provider.apiKey);
        await fiveSim.cancelOrder(order.providerOrderId);
      }
    } catch (e: any) {
      console.warn("Provider cancel call failed during API cancel:", e.message);
    }

    // 3. Update DB and Refund
    let newBalance = 0;
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED }
      });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { balance: { increment: order.sellPrice } }
      });
      newBalance = parseFloat(updatedUser.balance.toString());

      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: order.sellPrice,
          type: TransactionType.REFUND,
          description: `API İptali: ${order.serviceCode} (${order.countryCode})`,
          referenceId: order.id
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: "Order successfully cancelled and refunded.",
      newBalance,
      refundAmount: order.sellPrice
    });

  } catch (error: any) {
    console.error("v1/cancel API Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
