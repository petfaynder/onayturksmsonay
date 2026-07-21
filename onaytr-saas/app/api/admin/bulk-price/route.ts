import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

async function getAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, role: true },
  });
}

export async function POST(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { mode, value } = await req.json();
  // mode: "percent" (apply % markup change to all services), "set" (set specific margin)
  if (!mode || value === undefined) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const numValue = parseFloat(value);
  if (isNaN(numValue)) return NextResponse.json({ error: "Invalid value" }, { status: 400 });

  if (mode === "percent") {
    // Increase/decrease all service custom margins by a percentage
    const services = await prisma.service.findMany({ select: { id: true, margin5sim: true, marginHerosms: true } });
    let updated = 0;
    for (const svc of services) {
      const dataUpdate: any = {};
      let changed = false;

      if (svc.margin5sim !== null && svc.margin5sim !== undefined) {
        dataUpdate.margin5sim = Math.max(0, svc.margin5sim * (1 + numValue / 100));
        changed = true;
      }
      if (svc.marginHerosms !== null && svc.marginHerosms !== undefined) {
        dataUpdate.marginHerosms = Math.max(0, svc.marginHerosms * (1 + numValue / 100));
        changed = true;
      }

      if (changed) {
        await prisma.service.update({ where: { id: svc.id }, data: dataUpdate });
        updated++;
      }
    }

    await createAuditLog({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "BULK_PRICE_UPDATE",
      details: `${mode}: ${numValue > 0 ? "+" : ""}${numValue}% - ${updated} servis güncellendi`,
    });

    return NextResponse.json({ ok: true, updated });
  }

  if (mode === "default_margin") {
    // Update the global default margin in system settings
    await prisma.systemSetting.upsert({
      where: { key: "defaultMarginPercent" },
      create: { key: "defaultMarginPercent", value: String(numValue), description: "Varsayılan kâr marjı (%)" },
      update: { value: String(numValue) },
    });

    await createAuditLog({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "BULK_PRICE_UPDATE",
      details: `Default margin set to ${numValue}%`,
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown mode" }, { status: 400 });
}