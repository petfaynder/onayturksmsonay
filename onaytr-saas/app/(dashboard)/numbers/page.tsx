"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ListOrdered, Phone, Clock, XCircle, CheckCircle2, Loader2, RefreshCw, AlertCircle, Copy } from 'lucide-react';
import { redirect } from 'next/navigation';
import CancelButton from '@/components/CancelButton';
import { useLanguage } from '@/components/LanguageProvider';
import { getCountryFlagCode } from '@/lib/utils/icons';
import { getCountryName } from '@/lib/utils/countries';


export default function NumbersPage() {
  const { data: session, status } = useSession();
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [timerTick, setTimerTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRemainingTimeText = (createdAt: string) => {
    const createdTime = new Date(createdAt).getTime();
    const elapsed = Date.now() - createdTime;
    const remainingMs = Math.max(0, 1200000 - elapsed);
    if (remainingMs <= 0) return language === 'tr' ? 'Süre Doldu' : language === 'az' ? 'Vaxt Bitdi' : 'Expired';
    
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/login');
    }
    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // SMS Polling Logic for PENDING orders
  useEffect(() => {
    const pendingOrders = orders.filter(o => o.status === 'PENDING');
    if (pendingOrders.length === 0) return;

    const interval = setInterval(async () => {
      let hasChanges = false;
      const updatedOrders = await Promise.all(
        orders.map(async (order) => {
          if (order.status !== 'PENDING') return order;
          try {
            const res = await fetch(`/api/orders/check?orderId=${order.id}`);
            if (res.ok) {
              const data = await res.json();
              if (data.status !== order.status || data.smsCode !== order.smsCode) {
                hasChanges = true;
                return { ...order, status: data.status, smsCode: data.smsCode };
              }
            }
          } catch (e) {
            console.error(e);
          }
          return order;
        })
      );
      
      if (hasChanges) {
        setOrders(updatedOrders);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [orders]);

  const handleCancel = async (orderId: string) => {
    const confirmMsg = language === 'tr' ? 'Bu numarayı iptal etmek istediğinize emin misiniz?' : language === 'az' ? 'Bu nömrəni ləğv etmək istədiyinizdən əminsiniz?' : 'Are you sure you want to cancel this number?';
    if (!confirm(confirmMsg)) return;
    
    setIsCancelling(orderId);
    try {
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || (language === 'tr' ? 'İptal işlemi başarısız' : language === 'az' ? 'Ləğv əməliyyatı uğursuz oldu' : 'Cancellation failed'));
      
      const successMsg = language === 'tr' ? 'Numara başarıyla iptal edildi ve tutar bakiyenize iade edildi.' : language === 'az' ? 'Nömrə uğurla ləğv edildi və məbləğ balansınıza qaytarıldı.' : 'Number successfully cancelled and the amount refunded to your balance.';
      alert(successMsg);
      fetchOrders(); // Refresh list
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCancelling(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Simple visual feedback could be added here
  };

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  const d = (light: string, dark: string) => isDark ? dark : light;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const activeOrders = orders.filter(o => o.status === 'PENDING');
  const pastOrders = orders.filter(o => o.status !== 'PENDING');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
      
      <div className="flex items-center gap-4 mb-8">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${d('bg-indigo-50 border-indigo-100 text-[#4648d4]', 'bg-indigo-950/20 border-indigo-900/30 text-indigo-400')}`}>
          <ListOrdered className="h-6 w-6" />
        </div>
        <div className="text-left">
          <h1 className={`text-3xl font-black display-font ${d('text-slate-800', 'text-[#E6EDF3]')}`}>{t('nav_numaralarim')}</h1>
          <p className={`font-medium mt-1 text-sm ${d('text-slate-500', 'text-[#8B949E]')}`}>
            {language === 'tr' ? 'Aktif ve geçmiş tüm numara işlemleriniz.' : language === 'az' ? 'Aktiv və keçmiş bütün nömrə əməliyyatlarınız.' : 'All your active and past number transactions.'}
          </p>
        </div>
        
        <button 
          onClick={fetchOrders}
          className={`ml-auto flex items-center gap-2 px-4 py-2.5 border rounded-xl shadow-sm transition-all text-xs font-bold ${d('bg-white border-slate-200 text-slate-700 hover:border-indigo-200 hover:text-indigo-600', 'bg-[#21262D] border-[#30363D] text-[#E6EDF3] hover:border-indigo-850')}`}
        >
          <RefreshCw className="h-3.5 w-3.5" /> {t('dev_refresh_key')}
        </button>
      </div>

      {/* Active Orders Grid */}
      <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 text-left ${d('text-slate-850', 'text-[#E6EDF3]')}`}>
        <Clock className="h-4.5 w-4.5 text-indigo-500" /> {language === 'tr' ? 'Aktif Numaralar' : language === 'az' ? 'Aktiv Nömrələr' : 'Active Numbers'} ({t('db_kod_bekleniyor')})
      </h2>
      
      {activeOrders.length === 0 ? (
        <div className={`border rounded-2xl p-8 text-center flex flex-col items-center justify-center mb-10 shadow-sm backdrop-blur-md ${d('bg-white/40 border-white/60 text-slate-550', 'bg-[#161B22]/60 border-[#30363D] text-[#8B949E]')}`}>
           <Phone className="h-10 w-10 text-slate-400 mb-3 opacity-60" />
           <span className="font-extrabold">
             {language === 'tr' ? 'Aktif numaranız bulunmuyor.' : language === 'az' ? 'Aktiv nömrəniz yoxdur.' : 'You do not have any active numbers.'}
           </span>
           <span className="text-xs mt-1">
             {language === 'tr' ? 'Hemen yeni bir numara alarak işlemlere başlayabilirsiniz.' : language === 'az' ? 'Dərhal yeni nömrə alaraq işə başlaya bilərsiniz.' : 'You can get a new number right away and start.'}
           </span>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {activeOrders.map((order) => (
            <div key={order.id} className={`p-5 rounded-2xl border relative overflow-hidden group shadow-sm transition-all duration-300 ${d('bg-white/80 border-indigo-100', 'bg-[#161B22] border-[#30363D]')}`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-400/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  {/* Circular Country Flag */}
                  <div className={`h-8 w-8 rounded-full overflow-hidden border shrink-0 relative flex items-center justify-center shadow-3xs ${d('border-slate-200/60 bg-slate-50', 'border-[#30363D] bg-[#161B22]')}`}>
                    <span className={`fi fi-${getCountryFlagCode(order.countryCode)} !w-full !h-full rounded-full absolute inset-0 !bg-cover !bg-center`} />
                  </div>
                  <div>
                    <span className={`font-black uppercase text-xs block ${d('text-indigo-600', 'text-indigo-400')}`}>{order.serviceCode}</span>
                    <span className={`text-[10px] text-slate-400 font-bold block -mt-0.5`}>
                      {getCountryName(order.countryCode, order.countryCode, language)}
                    </span>
                  </div>
                </div>
                <CancelButton
                  createdAt={order.createdAt}
                  onCancel={() => handleCancel(order.id)}
                  isCancelling={isCancelling === order.id}
                />
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className={`text-2xl font-black tracking-wider font-mono ${d('text-slate-800', 'text-[#E6EDF3]')}`}>
                  {order.phoneNumber.startsWith('+') ? order.phoneNumber : `+${order.phoneNumber}`}
                </div>
                <button 
                  onClick={() => copyToClipboard(order.phoneNumber.startsWith('+') ? order.phoneNumber : `+${order.phoneNumber}`)} 
                  className={`p-2 rounded-lg transition-colors ${d('text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50', 'text-[#8B949E] hover:text-[#4648d4] bg-[#21262D] hover:bg-[#30363D]')}`}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>

              <div className={`border rounded-xl p-4 flex items-center justify-between gap-3 animate-glow-pulse ${d('bg-indigo-50/20 border-indigo-100/50', 'bg-indigo-950/10 border-indigo-900/20')}`}>
                <div className="flex items-center gap-2">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </div>
                  <span className={`text-xs font-black ${d('text-indigo-750', 'text-indigo-400')}`}>{t('db_kod_bekleniyor')}</span>
                </div>

                {/* Remaining time countdown badge */}
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black border tracking-wider font-mono ${
                  d('bg-rose-50 border-rose-100 text-rose-600', 'bg-rose-950/20 border-rose-900/40 text-rose-400')
                }`}>
                  <Clock className="h-3.5 w-3.5 animate-pulse" />
                  <span>{getRemainingTimeText(order.createdAt)}</span>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 font-bold border-t border-slate-100/10 pt-3">
                <span>{language === 'tr' ? 'Fiyat' : language === 'az' ? 'Qiymət' : 'Price'}: <strong className={`${d('text-slate-650', 'text-[#E6EDF3]')}`}>{order.sellPrice.toFixed(2)} ₺</strong></span>
                <span>ID: {order.id.split('-')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Past Orders Table */}
      <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 text-left ${d('text-slate-850', 'text-[#E6EDF3]')}`}>
        <CheckCircle2 className="h-4.5 w-4.5 text-slate-500" /> {language === 'tr' ? 'Geçmiş Numaralar' : language === 'az' ? 'Geçmiş Nömrələr' : 'Past Numbers'}
      </h2>

      <div className={`overflow-hidden border rounded-3xl backdrop-blur-xl shadow-sm ${d('bg-white/60 border-slate-200/55', 'bg-[#161B22]/90 border-[#30363D]')}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-xs font-black uppercase tracking-wider ${d('bg-slate-50/50 border-slate-200 text-slate-500', 'bg-[#0D1117]/60 border-[#30363D] text-[#8B949E]')}`}>
                <th className="p-4">{language === 'tr' ? 'Servis / Ülke' : language === 'az' ? 'Xidmət / Ölkə' : 'Service / Country'}</th>
                <th className="p-4">{language === 'tr' ? 'Numara' : language === 'az' ? 'Nömrə' : 'Number'}</th>
                <th className="p-4">{language === 'tr' ? 'SMS Kodu' : language === 'az' ? 'SMS Kodu' : 'SMS Code'}</th>
                <th className="p-4">{language === 'tr' ? 'Tutar' : language === 'az' ? 'Məbləğ' : 'Amount'}</th>
                <th className="p-4">{t('db_durum')}</th>
                <th className="p-4">{language === 'tr' ? 'Tarih' : language === 'az' ? 'Tarix' : 'Date'}</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-[13px] ${d('divide-slate-200/50', 'divide-[#30363D]/40')}`}>
              {pastOrders.map((order) => (
                <tr key={order.id} className={`transition-colors ${d('hover:bg-slate-50/30', 'hover:bg-[#21262D]/20')}`}>
                  <td className="p-4 text-left">
                    <div className="flex items-center gap-2.5">
                      {/* Circular Country Flag */}
                      <div className={`h-6.5 w-6.5 rounded-full overflow-hidden border shrink-0 relative flex items-center justify-center shadow-3xs ${d('border-slate-200/50 bg-slate-50', 'border-[#30363D] bg-[#161B22]')}`}>
                        <span className={`fi fi-${getCountryFlagCode(order.countryCode)} !w-full !h-full rounded-full absolute inset-0 !bg-cover !bg-center`} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-black capitalize text-sm leading-tight ${d('text-slate-800', 'text-[#E6EDF3]')}`}>{order.serviceCode}</span>
                        <span className="text-[10px] text-slate-400 font-bold leading-none mt-0.5">
                          {getCountryName(order.countryCode, order.countryCode, language)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className={`p-4 font-mono font-bold text-left ${d('text-slate-700', 'text-[#8B949E]')}`}>
                    {order.phoneNumber.startsWith('+') ? order.phoneNumber : `+${order.phoneNumber}`}
                  </td>
                  <td className="p-4 text-left">
                    {order.smsCode ? (
                      <span className={`px-3 py-1 rounded-lg font-mono font-black border ${d('bg-emerald-50 border-emerald-200 text-emerald-700', 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400')}`}>
                        {order.smsCode}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className={`p-4 font-bold text-left ${d('text-slate-650', 'text-[#E6EDF3]')}`}>
                    {order.sellPrice.toFixed(2)} ₺
                  </td>
                  <td className="p-4 text-left">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                      order.status === 'COMPLETED' ? 'bg-emerald-100/10 text-emerald-600 border-emerald-200/30' : 
                      order.status === 'CANCELLED' ? 'bg-rose-100/10 text-rose-600 border-rose-200/30' : 
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {order.status === 'COMPLETED' ? t('db_durum_completed') : 
                       order.status === 'CANCELLED' ? t('db_durum_cancelled') : 
                       order.status === 'REFUNDED' ? (language === 'tr' ? 'İade Edildi' : language === 'az' ? 'Geri Ödənildi' : 'Refunded') : order.status}
                    </span>
                  </td>
                  <td className={`p-4 text-sm font-medium text-left ${d('text-slate-500', 'text-[#8B949E]')}`}>
                    {new Date(order.createdAt).toLocaleString(language === 'tr' ? 'tr-TR' : language === 'az' ? 'az-AZ' : 'en-US')}
                  </td>
                </tr>
              ))}
              
              {pastOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-bold">
                    {language === 'tr' ? 'Geçmiş işlem bulunamadı.' : language === 'az' ? 'Keçmiş əməliyyat tapılmadı.' : 'No past transactions found.'}
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
