import prisma from '@/lib/db';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Search, History, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string, status?: string }>;
}) {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!dbUser || dbUser.role !== 'ADMIN') {
    redirect('/auth/login');
  }

  const resolvedSearchParams = await searchParams;
  const search = resolvedSearchParams?.search || '';
  const statusFilter = resolvedSearchParams?.status || '';

  const whereClause: any = {};
  if (search) {
    whereClause.OR = [
      { phoneNumber: { contains: search } },
      { user: { email: { contains: search } } },
      { id: { contains: search } }
    ];
  }
  if (statusFilter) {
    whereClause.status = statusFilter;
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      user: { select: { email: true } },
      provider: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 100 // Limit to 100 recent orders for performance
  });

  // Calculate some stats
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const totalRevenue = completedOrders.reduce((acc, o) => acc + o.sellPrice, 0);
  const totalCost = completedOrders.reduce((acc, o) => acc + o.costPrice, 0);
  const totalProfit = totalRevenue - totalCost;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 display-font">Sipariş Yönetimi</h1>
          <p className="text-slate-500 mt-1">Platform üzerinden alınan tüm numaraları görüntüleyin.</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <a
            href="/api/admin/export?type=orders"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-colors shadow-sm"
          >
            ↓ CSV İndir
          </a>

          {/* Simple Server-Side Search */}
          <form className="relative w-full md:w-auto flex gap-2" method="GET">
          <select name="status" defaultValue={statusFilter} className="px-4 py-2 bg-white/60 border border-white focus:border-teal-400 rounded-xl text-slate-800 outline-none shadow-sm">
            <option value="">Tüm Durumlar</option>
            <option value="PENDING">Bekleyen (PENDING)</option>
            <option value="COMPLETED">Tamamlanan (COMPLETED)</option>
            <option value="CANCELLED">İptal Edilen (CANCELLED)</option>
          </select>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="E-Posta veya Numara Ara..."
              className="w-full md:w-64 pl-10 pr-4 py-2 bg-white/60 border border-white focus:border-teal-400 rounded-xl text-slate-800 outline-none shadow-sm"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition-colors">
            Ara
          </button>
         </form>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-panel p-4 border border-white/60 flex flex-col justify-center">
          <span className="text-sm font-bold text-slate-500">Listelenen Sipariş</span>
          <span className="text-2xl font-black text-slate-800">{totalOrders}</span>
        </div>
        <div className="glass-panel p-4 border border-white/60 flex flex-col justify-center">
          <span className="text-sm font-bold text-slate-500">Tamamlanan Ciro</span>
          <span className="text-2xl font-black text-teal-600">{totalRevenue.toFixed(2)} ₺</span>
        </div>
        <div className="glass-panel p-4 border border-white/60 flex flex-col justify-center">
          <span className="text-sm font-bold text-slate-500">Maliyet</span>
          <span className="text-2xl font-black text-rose-500">{totalCost.toFixed(2)} ₺</span>
        </div>
        <div className="glass-panel p-4 border border-white/60 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-400/20 rounded-full blur-xl -mr-4 -mt-4"></div>
          <span className="text-sm font-bold text-slate-500 relative z-10">Net Kâr</span>
          <span className="text-2xl font-black text-emerald-600 relative z-10">{totalProfit.toFixed(2)} ₺</span>
        </div>
      </div>

      <div className="glass-panel overflow-hidden border border-white/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/40 border-b border-white/60 text-slate-600 text-sm font-bold">
                <th className="p-4">Kullanıcı</th>
                <th className="p-4">Servis/Ülke</th>
                <th className="p-4">Numara</th>
                <th className="p-4">Alış / Satış</th>
                <th className="p-4">Kâr</th>
                <th className="p-4">Durum</th>
                <th className="p-4">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const profit = order.sellPrice - order.costPrice;
                let parsedSms: any[] | null = null;
                if (order.smsCode && order.smsCode.startsWith('[')) {
                  try {
                    parsedSms = JSON.parse(order.smsCode);
                  } catch (e) {}
                }

                return (
                  <tr key={order.id} className="border-b border-white/20 hover:bg-white/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{order.user.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-800 capitalize flex items-center gap-1.5">
                        {order.serviceCode}
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          order.type === 'RENT' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-750 border border-slate-200'
                        }`}>
                          {order.type === 'RENT' ? 'Kiralama' : 'Tek Sefer'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 uppercase">{order.countryCode}</div>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-700">
                      +{order.phoneNumber}
                      {order.smsCode && (
                        parsedSms ? (
                          <div className="text-[10px] space-y-1 mt-1.5 font-sans">
                            {parsedSms.map((s: any, idx: number) => (
                              <div key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-1.5 rounded-lg max-w-[220px]">
                                <span className="font-extrabold text-[8px] block uppercase text-emerald-700">{s.sender}</span>
                                <span className="font-medium break-all">{s.text}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-emerald-600 font-bold mt-1">SMS: {order.smsCode}</div>
                        )
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      <div className="text-slate-500 line-through text-xs">{order.costPrice.toFixed(2)} ₺</div>
                      <div className="font-bold text-teal-600">{order.sellPrice.toFixed(2)} ₺</div>
                    </td>
                    <td className="p-4">
                      <span className={`font-black ${profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {profit >= 0 ? '+' : ''}{profit.toFixed(2)} ₺
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center w-fit gap-1 ${
                        order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                        order.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700 border-rose-200' : 
                        order.status === 'REFUNDED' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {order.status === 'COMPLETED' && <CheckCircle2 className="h-3 w-3" />}
                        {order.status === 'CANCELLED' && <XCircle className="h-3 w-3" />}
                        {order.status === 'PENDING' && <History className="h-3 w-3" />}
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500 font-medium">
                      {new Date(order.createdAt).toLocaleString('tr-TR')}
                    </td>
                  </tr>
                );
              })}
              
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-bold flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="h-8 w-8 text-slate-300" />
                    Sipariş bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
