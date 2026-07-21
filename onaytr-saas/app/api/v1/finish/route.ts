import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/apiAuth";
import prisma from "@/lib/db";
import { FiveSimProvider } from "@/lib/providers/5sim";
import { HeroSmsProvider } from "@/lib/providers/herosms";
import { OrderStatus } from "@prisma/client";
import { processReferralCommission } from "@/lib/referral";

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
      return NextResponse.json({ error: "Order is not in pending state" }, { status: 400 });
    }

    // 2. Call provider finish
    try {
      if (order.provider.name === "herosms") {
        const heroSms = new HeroSmsProvider(order.provider.apiKey);
        await heroSms.finishOrder(order.providerOrderId);
      } else {
        const fiveSim = new FiveSimProvider(order.provider.apiKey);
        await fiveSim.finishOrder(order.providerOrderId);
      }
    } catch (e: any) {
      console.warn("Provider finish call failed during API finish:", e.message);
    }

    // 3. Update DB
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.COMPLETED }
    });

    // 4. Process Referral Commission
    try {
      await processReferralCommission(order.userId, order.id, order.sellPrice);
    } catch (refErr) {
      console.error("Referral commission error in v1/finish order:", refErr);
    }

    return NextResponse.json({
      success: true,
      message: "Order successfully completed.",
      order: updatedOrder
    });

  } catch (error: any) {
    console.error("v1/finish API Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
