import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/apiAuth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await authenticateApiRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      select: {
        providerCode: true,
        name: true,
        logoUrl: true
      },
      orderBy: { sortOrder: "asc" }
    });

    return NextResponse.json({
      success: true,
      services: services.map(s => ({
        code: s.providerCode,
        name: s.name,
        logoUrl: s.logoUrl
      }))
    });
  } catch (error) {
    console.error("v1/services API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
