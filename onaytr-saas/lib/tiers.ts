import prisma from "@/lib/db";
import { getSystemSetting } from "@/lib/settings";

export async function updateUserTierAndSpend(userId: string, orderPrice: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, monthlySpend: true, tierLevel: true }
    });

    if (!user) return;

    // Calculate new spend
    const newSpend = +(user.monthlySpend + orderPrice).toFixed(2);

    // Update monthly spend in database
    await prisma.user.update({
      where: { id: userId },
      data: { monthlySpend: newSpend }
    });

    // Skip auto tier upgrades for admins and resellers
    if (user.role === 'ADMIN' || user.role === 'RESELLER') {
      return;
    }

    const silverLimitSetting = await getSystemSetting("TIER_SILVER_SPEND", "1000");
    const goldLimitSetting = await getSystemSetting("TIER_GOLD_SPEND", "5000");

    const silverLimit = parseFloat(silverLimitSetting) || 1000;
    const goldLimit = parseFloat(goldLimitSetting) || 5000;

    let newTier = 'BRONZE';
    if (newSpend >= goldLimit) {
      newTier = 'GOLD';
    } else if (newSpend >= silverLimit) {
      newTier = 'SILVER';
    }

    if (newTier !== user.tierLevel) {
      await prisma.user.update({
        where: { id: userId },
        data: { tierLevel: newTier }
      });
      console.log(`[Tier Upgrade] User ${userId} upgraded from ${user.tierLevel} to ${newTier} (Spend: ${newSpend} TL)`);
    }
  } catch (err) {
    console.error("Failed to update user tier and spend:", err);
  }
}
