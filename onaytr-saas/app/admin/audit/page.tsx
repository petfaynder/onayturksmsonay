import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { ClipboardList, Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!dbUser || dbUser.role !== "ADMIN") redirect("/auth/login");

  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams?.page ?? "1"));
  const limit = 50;
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count(),
  ]);

  const pages = Math.ceil(total / limit);

  const actionColors: Record<string, string> = {
    USER_BANNED: "bg-rose-100 text-rose-700 border-rose-200",
    USER_UNBANNED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    BALANCE_ADJUSTED: "bg-blue-100 text-blue-700 border-blue-200",
    ROLE_CHANGED: "bg-amber-100 text-amber-700 border-amber-200",
    SETTING_UPDATED: "bg-slate-100 text-slate-700 border-slate-200",
    COUPON_CREATED: "bg-purple-100 text-purple-700 border-purple-200",
    COUPON_DELETED: "bg-rose-100 text-rose-700 border-rose-200",
    ORDER_REFUNDED: "bg-orange-100 text-orange-700 border-orange-200",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-7 w-7 text-teal-600" />
          <div>
            <h1 className="text-3xl font-black text-slate-800 display-font">Audit Log</h1>
            <p className="text-slate-500 text-sm">Toplam {total} kayıt</p>
          </div>
        </div>
        <a
          href="/api/admin/export?type=users"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-colors"
        >
          <Download className="h-4 w-4" />
          CSV İndir
        </a>
      </div>

      <div className="glass-panel overflow-hidden border border-white/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/40 border-b border-white/60 text-slate-600 text-sm font-bold">
                <th className="p-4">Tarih</th>
                <th className="p-4">Admin</th>
                <th className="p-4">İşlem</th>
                <th className="p-4">Hedef</th>
                <th className="p-4">Detay</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-white/40 hover:bg-white/30 transition-colors">
                  <td className="p-4 text-xs text-slate-500 font-mono whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("tr-TR")}
                  </td>
                  <td className="p-4 text-sm font-bold text-slate-700">{log.adminEmail}</td>
                  <td className="p-4">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${actionColors[log.action] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600 font-mono">{log.targetType ? `${log.targetType}: ${log.targetId}` : "-"}</td>
                  <td className="p-4 text-sm text-slate-500 max-w-xs truncate">{log.details ?? "-"}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400 font-bold">
                    Henüz kayıt yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-white/40">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`?page=${p}`}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                  p === page
                    ? "bg-teal-600 text-white"
                    : "bg-white/60 text-slate-700 hover:bg-white"
                }`}
              >
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}