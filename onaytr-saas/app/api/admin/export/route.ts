import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";

async function isAdmin() {
  const session = await auth();
  if (!session?.user?.email) return false;
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } });
  return user?.role === "ADMIN";
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return new NextResponse("Forbidden", { status: 403 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "users";

  let csvContent = "";

  if (type === "users") {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        balance: true,
        isBanned: true,
        monthlySpend: true,
        tierLevel: true,
        referralCode: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });
    const headers = ["ID", "Email", "Rol", "Bakiye", "Engelli", "Aylık Harcama", "Tier", "Referans Kodu", "Sipariş Sayısı", "Kayıt Tarihi"];
    const rows = users.map(u => [
      u.id,
      u.email,
      u.role,
      u.balance.toFixed(2),
      u.isBanned ? "Evet" : "Hayır",
      u.monthlySpend.toFixed(2),
      u.tierLevel,
      u.referralCode ?? "",
      u._count.orders,
      new Date(u.createdAt).toLocaleString("tr-TR"),
    ]);
    csvContent = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  } else if (type === "orders") {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5000,
      include: { user: { select: { email: true } } },
    });
    const headers = ["ID", "Kullanıcı", "Servis", "Ülke", "Numara", "Durum", "Satış Fiyatı", "Maliyet", "Tarih"];
    const rows = orders.map(o => [
      o.id,
      o.user.email,
      o.serviceCode,
      o.countryCode,
      o.phoneNumber,
      o.status,
      o.sellPrice.toFixed(2),
      o.costPrice.toFixed(2),
      new Date(o.createdAt).toLocaleString("tr-TR"),
    ]);
    csvContent = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  } else if (type === "transactions") {
    const txs = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 5000,
      include: { user: { select: { email: true } } },
    });
    const headers = ["ID", "Kullanıcı", "Tür", "Miktar", "Açıklama", "Tarih"];
    const rows = txs.map(t => [
      t.id,
      t.user.email,
      t.type,
      t.amount.toFixed(2),
      t.description ?? "",
      new Date(t.createdAt).toLocaleString("tr-TR"),
    ]);
    csvContent = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  }

  const bom = "\uFEFF"; // UTF-8 BOM for Excel
  const filename = `onaytr-${type}-${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(bom + csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}