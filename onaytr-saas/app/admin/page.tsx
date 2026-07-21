import { Users, ShoppingCart, TrendingUp, Wallet, ShieldAlert, AlertTriangle, CheckCircle, Ban, RefreshCw, Flame, Activity, History, UserCheck } from 'lucide-react';
import prisma from '@/lib/db';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { FiveSimProvider } from '@/lib/providers/5sim';
import { HeroSmsProvider } from '@/lib/providers/herosms';
import { getCountryFlagCode } from '@/lib/utils/icons';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
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

  // 1. Fetch Stats
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [userCount, orderCount, totalBalanceAgg, successfulOrders, newUsersWeek, weeklyRevenueAgg, pendingOrders] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.user.aggregate({ _sum: { balance: true } }),
    prisma.order.count({ where: { status: 'COMPLETED' } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.transaction.aggregate({
      where: { type: 'DEPOSIT', createdAt: { gte: sevenDaysAgo } },
      _sum: { amount: true },
    }),
    prisma.order.count({ where: { status: 'PENDING' } }),
  ]);

  const totalBalance = totalBalanceAgg._sum.balance || 0;
  const weeklyRevenue = weeklyRevenueAgg._sum.amount || 0;
  const successRate = orderCount > 0 ? Math.round((successfulOrders / orderCount) * 100) : 0;

  const stats = [
    { name: 'Toplam Kullanıcı', value: userCount, sub: `+${newUsersWeek} bu hafta`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100/50' },
    { name: 'Toplam Sipariş', value: orderCount, sub: `${pendingOrders} bekliyor`, icon: ShoppingCart, color: 'text-teal-600', bg: 'bg-teal-100/50' },
    { name: 'Sistemdeki Bakiye', value: `${totalBalance.toFixed(2)} ₺`, sub: `${weeklyRevenue.toFixed(2)}₺ bu hafta gelir`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-100/50' },
    { name: 'Başarı Oranı', value: `%${successRate}`, sub: `${successfulOrders} tamamlandı`, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-100/50' },
  ];

  // 1.2 Fetch Top Selling Services & Countries (completed orders)
  const topSellingRaw = await prisma.order.groupBy({
    by: ['serviceCode', 'countryCode'],
    where: { status: 'COMPLETED' },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5
  });

  const allCountries = await prisma.country.findMany();
  const countryNameMap = new Map(allCountries.map(c => [c.providerCode, c]));

  const topSelling = topSellingRaw.map(t => {
    const c = countryNameMap.get(t.countryCode);
    return {
      service: t.serviceCode,
      countryCode: t.countryCode,
      countryName: c?.name || t.countryCode,
      flagCode: c?.flagCode || t.countryCode,
      count: t._count.id
    };
  });

  // 1.3 Fetch User Behavior: Top Active Users by Spend
  const topUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      monthlySpend: true,
      balance: true,
      _count: { select: { orders: true } }
    },
    orderBy: [
      { monthlySpend: 'desc' },
      { orders: { _count: 'desc' } }
    ],
    take: 5
  });

  // 1.4 Fetch User Behavior: Recent Clicks
  const recentActivities = await prisma.userRecentService.findMany({
    take: 5,
    orderBy: { usedAt: 'desc' },
    include: {
      user: { select: { email: true } }
    }
  });

  const totalCancelledOrders = await prisma.order.count({ where: { status: 'CANCELLED' } });
  const refundRate = orderCount > 0 ? Math.round((totalCancelledOrders / orderCount) * 100) : 0;

  // 2. Fetch active provider balances
  const dbProviders = await prisma.apiProvider.findMany();
  const providerBalances = await Promise.all(dbProviders.map(async (p) => {
    let liveBalance = p.balance;
    let success = true;
    try {
      if (p.isActive) {
        if (p.name === '5sim') {
          const fiveSim = new FiveSimProvider(p.apiKey);
          const profile = await fiveSim.getProfile();
          liveBalance = profile.balance;
          await prisma.apiProvider.update({ where: { id: p.id }, data: { balance: liveBalance } });
        } else if (p.name === 'herosms') {
          const heroSms = new HeroSmsProvider(p.apiKey);
          liveBalance = await heroSms.getBalance();
          await prisma.apiProvider.update({ where: { id: p.id }, data: { balance: liveBalance } });
        }
      }
    } catch (e) {
      console.error(`Failed to fetch live balance for ${p.name}:`, e);
      success = false;
    }
    return {
      name: p.name,
      balance: liveBalance,
      isActive: p.isActive,
      success
    };
  }));

  // 3. Compute Auto-Blocked Operators (from ProviderHealthLog in last 10 mins)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const healthLogs = await prisma.providerHealthLog.findMany({
    where: { createdAt: { gte: tenMinutesAgo } }
  });

  const groups: Record<string, {
    provider: string;
    country: string;
    service: string;
    operator: string;
    success: number;
    fail: number;
    lastLogAt: Date;
  }> = {};

  for (const log of healthLogs) {
    const key = `${log.providerName}-${log.countryCode}-${log.serviceCode}-${log.operatorCode || 'any'}`;
    if (!groups[key]) {
      groups[key] = {
        provider: log.providerName,
        country: log.countryCode,
        service: log.serviceCode,
        operator: log.operatorCode || 'any',
        success: 0,
        fail: 0,
        lastLogAt: log.createdAt
      };
    }
    if (log.isSuccess) {
      groups[key].success++;
    } else {
      groups[key].fail++;
    }
    if (log.createdAt > groups[key].lastLogAt) {
      groups[key].lastLogAt = log.createdAt;
    }
  }

  const blockedOperators = Object.values(groups)
    .filter(g => {
      const total = g.success + g.fail;
      return total >= 3 && (g.fail / total) >= 0.50; // Block if failed >= 50%
    })
    .map(g => {
      const total = g.success + g.fail;
      const failPercent = Math.round((g.fail / total) * 100);
      const remainingSeconds = Math.max(0, Math.round((g.lastLogAt.getTime() + 10 * 60 * 1000 - Date.now()) / 1000));
      const remainingMinutes = Math.ceil(remainingSeconds / 60);

      return {
        provider: g.provider,
        country: g.country,
        service: g.service,
        operator: g.operator,
        failPercent,
        remainingMinutes
      };
    });

  // Low balance warnings (any provider balance < $10)
  const lowBalanceProviders = providerBalances.filter(p => p.isActive && p.balance < 10.0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-800 display-font">Dashboard</h1>
      </div>

      {/* Low Balance Warning Banner */}
      {lowBalanceProviders.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-xs animate-pulse">
          <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0" />
          <div>
            <span className="font-extrabold">Kritik Bakiye Uyarısı!</span> Bazı sağlayıcı bakiyeleriniz tehlike sınırının (10.00 USD) altına düşmüştür:
            <span className="font-bold ml-1 text-rose-900">
              {lowBalanceProviders.map(p => `${p.name} ($${p.balance.toFixed(2)})`).join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-panel p-6 border border-white/60 relative overflow-hidden group shadow-xs">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon className={`h-24 w-24 ${stat.color} transform rotate-12`} />
            </div>
            
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 relative z-10 ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            
            <p className="text-slate-500 font-bold text-sm mb-1 relative z-10">{stat.name}</p>
            <h3 className="text-3xl font-black text-slate-800 relative z-10 display-font">{stat.value}</h3>
            {(stat as any).sub && <p className="text-xs text-slate-400 font-medium mt-1 relative z-10">{(stat as any).sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Sağlayıcı Bakiye Durumları */}
        <div className="glass-panel p-6 border border-white/60 flex flex-col shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-lg font-extrabold text-slate-800 display-font flex items-center gap-2">
              <Wallet className="h-5 w-5 text-teal-600" />
              Sağlayıcı Bakiye Durumları
            </h2>
          </div>
          
          <div className="mt-4 space-y-4 flex-1">
            {providerBalances.map((provider, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white/40 border border-white rounded-xl shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="font-extrabold text-slate-800 capitalize text-sm">{provider.name}</span>
                    <span className="text-[11px] font-medium text-slate-400">
                      Durum: {provider.isActive ? (
                        <span className="text-emerald-600 font-bold">Aktif</span>
                      ) : (
                        <span className="text-rose-500 font-bold">Pasif</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`font-black text-base display-font ${
                    provider.balance < 10.0 ? 'text-rose-600' : 'text-slate-800'
                  }`}>
                    $ {provider.balance.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">Bakiye (USD)</span>
                </div>
              </div>
            ))}
            
            {providerBalances.length === 0 && (
              <div className="text-center py-8 text-slate-400 font-bold">
                Kayıtlı API sağlayıcı bulunmamaktadır.
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Geçici Engellenen Operatörler (Auto-Blocked) */}
        <div className="glass-panel p-6 border border-white/60 flex flex-col shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-lg font-extrabold text-slate-800 display-font flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-600 animate-pulse" />
              Geçici Engellenen Operatörler (Auto-Blocked)
            </h2>
            <span className="text-xs text-rose-600 bg-rose-50 font-bold px-2.5 py-1 rounded-full">
              {blockedOperators.length} Rota Engelli
            </span>
          </div>

          <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-[300px]">
            {blockedOperators.map((blocked, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-rose-50/40 border border-rose-100 rounded-xl">
                <div className="flex flex-col">
                  <span className="font-extrabold text-slate-800 text-sm capitalize">
                    {blocked.country} - {blocked.service}
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold">
                    Sağlayıcı: <span className="capitalize">{blocked.provider}</span> • Hat: <span className="uppercase">{blocked.operator}</span>
                  </span>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="text-xs text-rose-600 font-black">
                    Yüksek İptal Oranı (%{blocked.failPercent})
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    Kalan Engel: {blocked.remainingMinutes} dk
                  </span>
                </div>
              </div>
            ))}

            {blockedOperators.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-bold flex flex-col items-center justify-center gap-2 flex-1">
                <CheckCircle className="h-10 w-10 text-emerald-500 opacity-60" />
                <span>Harika! Şu anda engellenmiş olan bir operatör rotası bulunmamaktadır.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: En Çok Satılan Servisler */}
        <div className="glass-panel p-6 border border-white/60 flex flex-col shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-lg font-extrabold text-slate-800 display-font flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-500" />
              En Çok Satılan Servisler & Ülkeler
            </h2>
          </div>
          
          <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-[350px]">
            {topSelling.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-white/40 border border-white rounded-xl shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-black text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div className="h-6 w-6 rounded-full overflow-hidden border shrink-0 relative flex items-center justify-center shadow-2xs animate-fade-in">
                    <span className={`fi fi-${getCountryFlagCode(item.flagCode)} !w-full !h-full rounded-full absolute inset-0 !bg-cover !bg-center`} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-extrabold text-slate-800 text-sm capitalize">{item.service}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{item.countryName}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="text-sm font-black text-slate-800 display-font">{item.count} adet</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Tamamlanan Satış</span>
                </div>
              </div>
            ))}

            {topSelling.length === 0 && (
              <div className="text-center py-12 text-slate-400 font-bold flex flex-col items-center justify-center gap-2">
                <span>Henüz tamamlanmış satış verisi bulunmamaktadır.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Kullanıcı Davranış Analizi */}
        <div className="glass-panel p-6 border border-white/60 flex flex-col shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-lg font-extrabold text-slate-800 display-font flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600 animate-pulse" />
              Kullanıcı Davranış Analizi
            </h2>
            <div className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full flex items-center gap-1">
              <span>İptal Oranı:</span>
              <strong className="text-indigo-900 font-black">%{refundRate}</strong>
            </div>
          </div>

          <div className="mt-4 space-y-4 flex-1">
            {/* Recent Clicks Feed */}
            <div>
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-2 relative z-10">
                <History className="h-3.5 w-3.5 shrink-0" /> Canlı Arama ve Tıklama Akışı
              </span>
              <div className="space-y-2 overflow-y-auto max-h-[140px] pr-1">
                {recentActivities.map((act, idx) => (
                  <div key={act.id || idx} className="flex items-center justify-between p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl text-xs">
                    <div className="flex flex-col text-left">
                      <span className="font-extrabold text-slate-700 truncate max-w-[180px]">{act.user.email}</span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {new Date(act.usedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <span className="font-bold text-slate-800 capitalize bg-white border border-slate-100 px-2 py-0.5 rounded-lg shadow-2xs">
                      {act.serviceCode} / {countryNameMap.get(act.countryCode)?.name || act.countryCode}
                    </span>
                  </div>
                ))}
                {recentActivities.length === 0 && (
                  <div className="text-center py-6 text-slate-400 font-bold text-xs bg-slate-50/40 rounded-xl border border-dashed border-slate-200">
                    Henüz canlı tıklama aktivitesi bulunmuyor.
                  </div>
                )}
              </div>
            </div>

            {/* Top VIP Spenders */}
            <div className="border-t border-slate-100 pt-3">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
                <UserCheck className="h-3.5 w-3.5 shrink-0" /> En Aktif Kullanıcılar (Ciroya Göre)
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-400 font-bold border-b text-[10px]">
                      <th className="pb-1.5">E-Posta</th>
                      <th className="pb-1.5 text-right">Harcama</th>
                      <th className="pb-1.5 text-right">Sipariş</th>
                      <th className="pb-1.5 text-right">Bakiye</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUsers.map((u, idx) => (
                      <tr key={u.id || idx} className="border-b last:border-0 hover:bg-slate-50/40">
                        <td className="py-2 font-bold text-slate-700 truncate max-w-[130px]">{u.email}</td>
                        <td className="py-2 text-right font-black text-slate-800">{u.monthlySpend.toFixed(2)} ₺</td>
                        <td className="py-2 text-right font-bold text-slate-500">{u._count.orders}</td>
                        <td className="py-2 text-right font-bold text-teal-600">{u.balance.toFixed(2)} ₺</td>
                      </tr>
                    ))}
                    {topUsers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-slate-400 font-bold">
                          Kullanıcı bulunmamaktadır.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
