import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { generateReferralCode } from "@/lib/referral";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        referralCode: true,
        referredById: true,
        referralEarnings: {
          orderBy: { createdAt: "desc" },
          take: 50,
          select: { id: true, amount: true, createdAt: true, referredId: true },
        },
        referredUsers: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Generate referral code if not exists
    if (!user.referralCode) {
      const code = generateReferralCode();
      await prisma.user.update({ where: { id: user.id }, data: { referralCode: code } });
      user = { ...user, referralCode: code };
    }

    const totalEarnings = user.referralEarnings.reduce((s, e) => s + e.amount, 0);
    const siteUrl = process.env.NEXTAUTH_URL ?? "https://onaytr.com";

    return NextResponse.json({
      referralCode: user.referralCode,
      referralLink: `${siteUrl}?ref=${user.referralCode}`,
      totalEarnings: +totalEarnings.toFixed(2),
      totalReferrals: user.referredUsers.length,
      earnings: user.referralEarnings,
      referredUsers: user.referredUsers.map((u) => ({
        id: u.id,
        email: u.email.replace(/(.{2}).+(@.+)/, "$1***$2"),
        joinedAt: u.createdAt,
      })),
    });
  } catch (e: any) {
    console.error("Referral API error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}