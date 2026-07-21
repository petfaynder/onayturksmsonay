import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

async function isAdmin() {
  const session = await auth();
  if (!session?.user?.email) return { admin: false, email: "" };
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true, email: true } });
  return { admin: user?.role === "ADMIN", email: user?.email ?? "" };
}

export async function GET(req: NextRequest) {
  const { admin } = await isAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 50;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count(),
  ]);

  return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit) });
}

export const dynamic = "force-dynamic";