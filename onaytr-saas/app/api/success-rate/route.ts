import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const serviceCode = searchParams.get("service");
  const countryCode = searchParams.get("country");

  if (!serviceCode || !countryCode) {
    return NextResponse.json({ rate: null, total: 0 });
  }

  // Last 7 days
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, success] = await Promise.all([
    prisma.providerHealthLog.count({
      where: { serviceCode, countryCode, createdAt: { gte: since } },
    }),
    prisma.providerHealthLog.count({
      where: { serviceCode, countryCode, isSuccess: true, createdAt: { gte: since } },
    }),
  ]);

  const rate = total > 0 ? Math.round((success / total) * 100) : null;
  return NextResponse.json({ rate, total, success });
}