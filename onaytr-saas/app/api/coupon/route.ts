import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code, amount } = await req.json();
  if (!code || !amount) {
    return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
  }

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

  if (!coupon || !coupon.isActive) {
    return NextResponse.json({ error: "Geçersiz kupon kodu" }, { status: 400 });
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: "Kupon süresi dolmuş" }, { status: 400 });
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: "Kupon kullanım limiti dolmuş" }, { status: 400 });
  }

  if (amount < coupon.minAmount) {
    return NextResponse.json({
      error: `Bu kupon minimum ${coupon.minAmount.toFixed(2)}₺ yükleme için geçerlidir`,
    }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Check if user already used this coupon
  const alreadyUsed = await prisma.couponUsage.findFirst({
    where: { couponId: coupon.id, userId: user.id },
  });
  if (alreadyUsed) {
    return NextResponse.json({ error: "Bu kuponu zaten kullandınız" }, { status: 400 });
  }

  // Calculate discount
  let discount = 0;
  if (coupon.type === "PERCENT") {
    discount = +(amount * (coupon.value / 100)).toFixed(2);
  } else {
    discount = Math.min(coupon.value, amount);
  }

  return NextResponse.json({
    valid: true,
    discount,
    finalAmount: +(amount - discount).toFixed(2),
    couponId: coupon.id,
    message: `${coupon.type === "PERCENT" ? `%${coupon.value}` : `${coupon.value}₺`} indirim uygulandı!`,
  });
}