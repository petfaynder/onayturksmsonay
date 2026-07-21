import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  return user?.id ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [favorites, recents] = await Promise.all([
    prisma.userFavorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userRecentService.findMany({
      where: { userId },
      orderBy: { usedAt: "desc" },
      take: 10,
    }),
  ]);

  return NextResponse.json({ favorites, recents });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { serviceCode, countryCode } = await req.json();
  if (!serviceCode || !countryCode) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  try {
    await prisma.userFavorite.create({ data: { userId, serviceCode, countryCode } });
    return NextResponse.json({ ok: true, action: "added" });
  } catch (e: any) {
    // Already exists - remove (toggle)
    if (e.code === "P2002") {
      await prisma.userFavorite.delete({
        where: { userId_serviceCode_countryCode: { userId, serviceCode, countryCode } },
      });
      return NextResponse.json({ ok: true, action: "removed" });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}