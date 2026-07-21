import { customAlphabet } from "nanoid";
import prisma from "@/lib/db";

import { getSystemSetting } from "@/lib/settings";

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

export function generateReferralCode(): string {
  return nanoid();
}

export const REFERRAL_COMMISSION_RATE = 0.05; // 5%

export async function processReferralCommission(
  userId: string,
  orderId: string,
  orderAmount: number
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referredById: true },
    });

    if (!user?.referredById) return;

    // Get referral commission rate dynamically (e.g., "5" for 5%)
    const referralPercentSetting = await getSystemSetting("REFERRAL_PERCENT", "5");
    const referralPercent = parseFloat(referralPercentSetting);
    const commissionRate = isNaN(referralPercent) ? REFERRAL_COMMISSION_RATE : referralPercent / 100;

    const commissionAmount = +(orderAmount * commissionRate).toFixed(2);
    if (commissionAmount <= 0) return;

    // Add commission to referrer
    await prisma.$transaction([
      prisma.referralEarning.create({
        data: {
          earnerId: user.referredById,
          referredId: userId,
          orderId,
          amount: commissionAmount,
        },
      }),
      prisma.user.update({
        where: { id: user.referredById },
        data: { balance: { increment: commissionAmount } },
      }),
      prisma.transaction.create({
        data: {
          userId: user.referredById,
          amount: commissionAmount,
          type: "REFERRAL_COMMISSION",
          description: `Referans komisyonu - Sipariş #${orderId.slice(-8)}`,
          referenceId: orderId,
        },
      }),
    ]);
  } catch (err) {
    console.error("Referral commission error:", err);
  }
}