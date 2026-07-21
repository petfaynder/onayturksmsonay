import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/apiAuth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await authenticateApiRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  }

  try {
    // 1. Fetch Order and verify ownership
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden (You do not own this order)" }, { status: 403 });
    }

    // 2. Call internal check API
    const host = req.headers.get("host") || "localhost:3000";
    const proto = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";

    const internalRes = await fetch(`${proto}://${host}/api/orders/check?orderId=${orderId}`, {
      headers: {
        'x-internal-key': process.env.NEXTAUTH_SECRET || ''
      },
      cache: "no-store"
    });

    const data = await internalRes.json();
    if (!internalRes.ok) {
      return NextResponse.json(data, { status: internalRes.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("v1/check API Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
