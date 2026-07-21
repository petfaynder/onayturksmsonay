"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bolt, Clock, Play, ArrowDown, Smartphone, Phone, ListOrdered, ChevronDown, CheckCircle2, Server, Search, Sparkles, Globe, Network, Loader2, AlertCircle, Copy, RefreshCw, Heart, History, Award, X } from 'lucide-react';
import CancelButton from '@/components/CancelButton';
import AppLogo from '@/components/AppLogo';
import { useToast } from '@/components/ToastProvider';
import { getCountryFlagCode } from '@/lib/utils/icons';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { countryCallingCodes, getCountryName } from '@/lib/utils/countries';

const renderSignalBars = (count: number) => {
  let activeBars = 1;
  let color = 'bg-slate-300';
  if (count >= 1000) {
    activeBars = 3;
    color = 'bg-emerald-500';
  } else if (count >= 100) {
    activeBars = 2;
    color = 'bg-emerald-500';
  } else if (count >= 10) {
    activeBars = 1;
    color = 'bg-amber-500';
  } else {
    activeBars = 1;
    color = 'bg-slate-300';
  }

  return (
    <div className="flex items-end gap-[2px] h-3 w-3.5 shrink-0" title={`${count} adet stok`}>
      <div className={`w-[2.5px] h-[35%] rounded-[1px] ${activeBars >= 1 ? color : 'bg-slate-200'}`}></div>
      <div className={`w-[2.5px] h-[65%] rounded-[1px] ${activeBars >= 2 ? color : 'bg-slate-200'}`}></div>
      <div className={`w-[2.5px] h-[100%] rounded-[1px] ${activeBars >= 3 ? color : 'bg-slate-200'}`}></div>
    </div>
  );
};


export default function Dashboard() {
  const [pricingData, setPricingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedApp, setSelectedApp] = useState<string | null>('whatsapp');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  
  const [appSearch, setAppSearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [countrySort, setCountrySort] = useState<'stock' | 'price' | 'name'>('stock');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [successRate, setSuccessRate] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<{serviceCode: string; countryCode: string}[]>([]);
  const [recents, setRecents] = useState<{serviceCode: string; countryCode: string; usedAt: string}[]>([]);
  const [favTogglingKey, setFavTogglingKey] = useState<string | null>(null);

  // Active Orders State
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [timerTick, setTimerTick] = useState(0);
  const [isBuying, setIsBuying] = useState(false);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

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

  // Recommendations Modal State
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const user = session?.user as any;
  const { showToast, showAlert, showConfirm } = useToast();
  const { isDark } = useTheme();
  const { t, language } = useLanguage();

  // Dark mode helper
  const d = (light: string, dark: string) => isDark ? dark : light;

  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
    if (status === 'authenticated' && !hasInitialized) {
      setHasInitialized(true);
      fetchActiveOrders();
      syncBalanceFromDB();
    }
  }, [status, router, hasInitialized]);

  useEffect(() => {
    fetchPricing();
  }, []);

  // Periodically sync balance from DB (every 30 seconds) so the
  // dashboard card and the profile page always show the same value.
  useEffect(() => {
    if (status !== 'authenticated') return;
    const balanceInterval = setInterval(syncBalanceFromDB, 30_000);
    return () => clearInterval(balanceInterval);
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/favorites')
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) { setFavorites(d.favorites || []); setRecents(d.recents || []); } });
    }
  }, [status]);

  useEffect(() => {
    if (!selectedApp || !selectedCountry) { setSuccessRate(null); return; }
    fetch(`/api/success-rate?service=${selectedApp}&country=${selectedCountry}`)
      .then(r => r.json())
      .then(d => setSuccessRate(d.rate));
  }, [selectedApp, selectedCountry]);

  // Fetch fresh balance from DB and update JWT session so dashboard card matches profile page
  const syncBalanceFromDB = async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        if (data.balance !== undefined) {
          await updateSession({ balance: data.balance });
        }
      }
    } catch (e) {
      // Non-critical — fail silently
    }
  };

  const fetchActiveOrders = async () => {
    try {
      const res = await fetch('/api/orders?type=ACTIVATION');
      if (res.ok) {
        const data = await res.json();
        const pending = (data.orders || []).filter((o: any) => o.status === 'PENDING');
        setActiveOrders(pending);
      }
    } catch (e) {
      console.error('Error fetching active orders:', e);
    }
  };

  const fetchPricing = async () => {
    try {
      const res = await fetch('/api/pricing', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch pricing');
      const data = await res.json();
      setPricingData(data);
      if (data.apps && data.apps.length > 0 && !selectedApp) {
        setSelectedApp(data.apps[0].name);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isRecommendModalOpen && selectedApp) {
      setIsLoadingRecommendations(true);
      fetch(`/api/recommendations?service=${selectedApp}`)
        .then(res => res.json())
        .then(data => {
          setRecommendations(data.recommendations || []);
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoadingRecommendations(false));
    }
  }, [isRecommendModalOpen, selectedApp]);

  const toggleFavorite = async (serviceCode: string, countryCode: string) => {
    const key = `${serviceCode}-${countryCode}`;
    setFavTogglingKey(key);
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceCode, countryCode }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.action === 'added') {
          setFavorites(prev => [...prev, { serviceCode, countryCode }]);
          showToast(t('db_toast_fav_added'), 'success');
        } else {
          setFavorites(prev => prev.filter(f => !(f.serviceCode === serviceCode && f.countryCode === countryCode)));
          showToast(t('db_toast_fav_removed'), 'info');
        }
      }
    } catch (e) { /* silent */ }
    setFavTogglingKey(null);
  };

  const isFavorite = (serviceCode: string, countryCode: string) =>
    favorites.some(f => f.serviceCode === serviceCode && f.countryCode === countryCode);

  const handleCancel = (orderId: string) => {
    showConfirm(
      t('db_toast_cancel_confirm_title'),
      t('db_toast_cancel_confirm_body'),
      async () => {
        setIsCancelling(orderId);
        try {
          const res = await fetch('/api/orders/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
          });
          const data = await res.json();
          
          if (!res.ok) throw new Error(data.error || 'İptal işlemi başarısız');
          
          showToast(t('db_toast_cancelled'), 'success');
          setActiveOrders(prev => prev.filter(o => o.id !== orderId));
          // Bakiyeyi güncelle
          if (data.newBalance !== undefined) {
            await updateSession({ balance: data.newBalance });
          } else {
            router.refresh();
          }
        } catch (err: any) {
          showAlert('Hata', err.message, 'error');
        } finally {
          setIsCancelling(null);
        }
      }
    );
  };

  const handleFinishOrder = async (orderId: string) => {
    try {
      const res = await fetch('/api/orders/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'İşlem tamamlanamadı');
      
      setActiveOrders(prev => prev.filter(o => o.id !== orderId));
      showToast(t('db_toast_done'), "success");
      router.refresh();
    } catch (err: any) {
      showAlert("Hata", err.message, "error");
    }
  };

  const handleResendSms = async (orderId: string) => {
    try {
      const res = await fetch('/api/orders/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Tekrar kod isteme başarısız');
      
      setActiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, smsCode: null } : o));
      showToast("Tekrar kod isteği gönderildi. Yeni kod bekleniyor...", "success");
    } catch (err: any) {
      showAlert("Hata", err.message, "error");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(t('db_toast_copied'), "success");
  };

  // SMS Polling Logic
  useEffect(() => {
    if (activeOrders.length === 0) return;

    const interval = setInterval(async () => {
      let balanceChanged = false;
      const updatedOrders = await Promise.all(
        activeOrders.map(async (order) => {
          if (order.status !== 'PENDING') return order;
          try {
            const res = await fetch(`/api/orders/check?orderId=${order.id}`);
            if (res.ok) {
              const data = await res.json();
              // If an order was auto-cancelled by the server (expiry), sync balance
              if (data.status === 'CANCELLED' && order.status === 'PENDING') {
                balanceChanged = true;
                showToast(t('db_toast_expire_auto'), 'info');
              }
              return { ...order, status: data.status, smsCode: data.smsCode };
            }
          } catch (e) {
            console.error(e);
          }
          return order;
        })
      );

      // Remove non-pending from active list and refresh balance if needed
      setActiveOrders(updatedOrders.filter((o: any) => o.status === 'PENDING'));
      if (balanceChanged) {
        await syncBalanceFromDB();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [activeOrders]);

  const handleBuy = async (operatorKey: string) => {
    if (!selectedApp || !selectedCountry || !pricingData) return;
    if (!user) {
      showAlert("Giriş Gerekli", "Lütfen işlem yapabilmek için önce giriş yapın.", "warning");
      return;
    }

    const opData = pricingData.detailedPricing[selectedCountry][selectedApp].operators[operatorKey];
    const price = opData?.priceTry || 0;

    showConfirm(
      "Numara Satın Al",
      `${selectedApp.toUpperCase()} servisi için ${selectedCountry.toUpperCase()} numarası satın alınacaktır. Ücret: ${price} ₺. Onaylıyor musunuz?`,
      async () => {
        setIsBuying(true);
        try {
          const res = await fetch('/api/orders/buy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              country: selectedCountry,
              product: selectedApp,
              operatorKey: operatorKey
            })
          });
          
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Satın alma başarısız');
          
          // Add to active orders
          setActiveOrders([data.order, ...activeOrders]);

          // Bakiyeyi session'a yansıt
          if (data.newBalance !== undefined) {
            await updateSession({ balance: data.newBalance });
          }

          // Alternatif numara bildirimi
          if (data.refundAmount > 0) {
            showToast(
              `✅ Numara alındı! Seçtiğiniz hatta stok kalmadığı için alternatif bir hat üzerinden daha ucuz numara sağlandı. ${data.refundAmount.toFixed(2)} ₺ bakiyenize iade edildi.`,
              'success'
            );
          } else if (data.extraChargeAmount > 0) {
            showToast(
              `⚠️ Numara alındı! Seçtiğiniz hat doldu, alternatif bir hat kullanıldı. Ek ${data.extraChargeAmount.toFixed(2)} ₺ bakiyenizden düşüldü.`,
              'warning'
            );
          } else {
            showToast('✅ Numara başarıyla alındı!', 'success');
          }
        } catch (err: any) {
          showAlert('Hata', err.message, 'error');
        } finally {
          setIsBuying(false);
        }
      }
    );
  };


  // Filter and sort apps based on search and preferred order
  const filteredApps = (() => {
    const rawFiltered = pricingData?.apps?.filter((app: any) => 
      app.name.toLowerCase().includes(appSearch.toLowerCase())
    ) || [];

    const preferredOrder = [
      'whatsapp',
      'telegram',
      'google',
      'gmail',
      'youtube',
      'claude',
      'facebook',
      'instagram',
      'twitter',
      'x',
      'tinder',
      'tiktok',
      'amazon',
      'apple',
      'wechat',
      'microsoft',
      'other',
      'ot',
      'vkontakte',
      'vk',
      'discord',
      'openai',
      'twitch',
      'netflix',
      'signal',
      'linkedin',
      'viber',
      'paypal',
      'happn',
      'bolt',
      'yandex',
      'doordash',
      'lyft'
    ];

    return [...rawFiltered].sort((a: any, b: any) => {
      const idxA = preferredOrder.indexOf(a.name.toLowerCase());
      const idxB = preferredOrder.indexOf(b.name.toLowerCase());
      
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return b.count - a.count;
    });
  })();

  // Filter countries based on selected app and search (by name or calling code prefix)
  const availableCountriesForApp = selectedApp && pricingData?.detailedPricing 
    ? Object.keys(pricingData.detailedPricing).filter(country => pricingData.detailedPricing[country][selectedApp])
    : [];

  const filteredCountries = pricingData?.countries?.filter((c: any) => {
    const callingCode = countryCallingCodes[c.code.toLowerCase().replace(/[^a-z0-9]/g, '')] || '';
    const matchesSearch = c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
                          callingCode.includes(countrySearch.toLowerCase()) ||
                          (countrySearch.replace('+', '').length > 0 && callingCode.includes(countrySearch.replace('+', '')));
    return availableCountriesForApp.includes(c.code) && matchesSearch;
  }) || [];

  // Sort countries based on user choice
  const sortedCountries = [...filteredCountries].sort((a: any, b: any) => {
    if (!selectedApp) return 0;
    const aDetails = pricingData?.detailedPricing[a.code][selectedApp];
    const bDetails = pricingData?.detailedPricing[b.code][selectedApp];
    
    if (!aDetails || !bDetails) return 0;

    if (countrySort === 'stock') {
      return sortDirection === 'desc' 
        ? bDetails.totalCount - aDetails.totalCount 
        : aDetails.totalCount - bDetails.totalCount;
    }

    if (countrySort === 'price') {
      return sortDirection === 'desc'
        ? bDetails.minPrice - aDetails.minPrice
        : aDetails.minPrice - bDetails.minPrice;
    }

    if (countrySort === 'name') {
      return sortDirection === 'desc'
        ? b.name.localeCompare(a.name, 'tr')
        : a.name.localeCompare(b.name, 'tr');
    }

    return 0;
  });

  // Get operators for selected app & country
  const selectedServiceDetails = (selectedApp && selectedCountry && pricingData?.detailedPricing)
    ? pricingData.detailedPricing[selectedCountry][selectedApp]
    : null;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col items-center text-center mb-12 mt-4">
        
        {/* Switcher */}
        <div className={`relative inline-grid grid-cols-2 items-center rounded-full p-1.5 mb-8 shadow-sm backdrop-blur-md border ${d('bg-white/40 border-white/60', 'bg-[#161B22]/60 border-[#30363D]')}`}>
          <div className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-[#4648d4] to-[#712ae2] rounded-full shadow-[0_4px_12px_rgba(70,72,212,0.25)] z-0 transition-transform duration-500"></div>
          <button className="w-full relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-[15px] font-bold text-white transition-colors">
            <Bolt className="h-4 w-4 shrink-0" />
            <span>{t('nav_tek_kullanimlik')}</span>
          </button>
          <button 
            onClick={() => router.push('/rent')}
            className={`w-full relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-[15px] font-bold transition-colors group ${d('text-slate-600 hover:text-indigo-700', 'text-[#8B949E] hover:text-indigo-400')}`}
          >
            <span className="absolute -top-2 right-2 text-[9px] font-black text-white bg-gradient-to-r from-rose-500 to-pink-500 px-2 py-0.5 rounded-full shadow-md animate-bounce">{t('nav_yeni')}</span>
            <Clock className="h-4 w-4 opacity-70 group-hover:rotate-12 transition-transform shrink-0" />
            <span>{t('nav_kiralik')}</span>
          </button>
        </div>

        <h1 className={`text-4xl md:text-5xl font-black mb-4 flex items-center justify-center gap-3 display-font relative drop-shadow-sm ${d('text-slate-800', 'text-[#E6EDF3]')}`}>
          <div className="absolute -inset-4 bg-indigo-400/10 blur-2xl rounded-full -z-10"></div>
          <Smartphone className="h-10 w-10 text-[#4648d4]" />
          {t('db_baslik')}
          <Sparkles className="h-6 w-6 text-yellow-400 absolute -right-8 -top-2 animate-pulse" />
        </h1>
        <p className={`font-medium max-w-2xl text-[16px] leading-relaxed ${d('text-slate-600', 'text-[#8B949E]')}`}>
          {t('db_aciklama')}
        </p>
      </div>

      {/* 3 COLUMN LAYOUT */}
      <div className="flex flex-col lg:flex-row justify-center gap-6 xl:gap-8 w-full">
        
        {/* COLUMN 1: Aktif Numaralar */}
        <div className={`w-full lg:w-1/3 flex flex-col overflow-hidden h-[800px] transition-all duration-300 hover:-translate-y-1 rounded-2xl border backdrop-blur-xl shadow-lg ${d('bg-white/60 border-white/40', 'bg-[#161B22]/90 border-[#30363D]')}`}>
          <div className={`px-6 py-5 flex items-center gap-3 border-b ${d('bg-white/30 border-white/30', 'bg-[#0D1117]/50 border-[#21262D]')}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[#4648d4] ${d('bg-indigo-50', 'bg-indigo-950/20')}`}>
              <Phone className="h-4 w-4" />
            </div>
            <span className={`font-extrabold text-lg display-font flex items-center gap-2 ${d('text-slate-800', 'text-[#E6EDF3]')}`}>
              {t('db_aktif_siparisler')} 
              {activeOrders.length > 0 && (
                <div className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </div>
              )}
            </span>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-y-auto custom-scrollbar">
             {activeOrders.length === 0 ? (
               <>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-400/5 rounded-full blur-3xl -z-10"></div>
                 <div className={`h-20 w-20 border shadow-xl rounded-2xl flex items-center justify-center mb-6 transform rotate-3 ${d('bg-white/60 border-white', 'bg-[#21262D]/60 border-[#30363D]')}`}>
                    <Phone className={`h-10 w-10 ${d('text-slate-300', 'text-[#484F58]')}`} />
                 </div>
                 <h3 className={`text-xl font-bold mb-2 display-font ${d('text-slate-800', 'text-[#E6EDF3]')}`}>
                   {language === 'tr' ? 'Henüz Numara Yok' : language === 'az' ? 'Hələ Nömrə Yoxdur' : 'No Numbers Yet'}
                 </h3>
                 <p className={`text-[15px] font-medium leading-relaxed ${d('text-slate-500', 'text-[#8B949E]')}`}>
                   {language === 'tr' ? 'Aktif bir numaranız bulunmuyor. Sağdaki panelden uygulama ve ülke seçerek hemen bir numara alabilirsiniz.' : language === 'az' ? 'Aktiv nömrəniz yoxdur. Sağ paneldən tətbiq və ölkə seçərək dərhal nömrə ala bilərsiniz.' : 'You do not have any active numbers. Select a service and country from the right panel to get one.'}
                 </p>
               </>
             ) : (
               <div className="w-full flex flex-col gap-4 h-full pt-4">
                 {activeOrders.map((order, i) => (
                    <div key={order.id || i} className={`rounded-xl p-4 shadow-sm text-left relative overflow-hidden border ${d('bg-white/80 border-indigo-100', 'bg-[#161B22] border-[#30363D]')}`}>
                       <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-2.5">
                           {/* Circular Country Flag */}
                           <div className={`h-8 w-8 rounded-full overflow-hidden border shrink-0 relative flex items-center justify-center shadow-3xs ${d('border-slate-200/60 bg-slate-50', 'border-[#30363D] bg-[#161B22]')}`}>
                             <span className={`fi fi-${getCountryFlagCode(order.countryCode)} !w-full !h-full rounded-full absolute inset-0 !bg-cover !bg-center`} />
                           </div>
                           <div>
                             <span className={`font-extrabold uppercase text-sm block ${d('text-indigo-600', 'text-indigo-400')}`}>{order.serviceCode}</span>
                             <span className={`text-[10px] font-mono uppercase block ${d('text-slate-400', 'text-[#484F58]')}`}>
                               {getCountryName(order.countryCode, order.countryCode, language)} • ID: {order.id.split('-')[0]}
                             </span>
                           </div>
                         </div>
                         {order.status === 'PENDING' && (
                           <CancelButton 
                             createdAt={order.createdAt}
                             onCancel={() => handleCancel(order.id)}
                             isCancelling={isCancelling === order.id}
                           />
                         )}
                       </div>

                       <div className="flex items-center justify-between mb-3">
                         <div className="flex items-center gap-2">
                           <div className={`text-xl font-black tracking-wider font-mono ${d('text-slate-800', 'text-[#E6EDF3]')}`}>
                             {order.phoneNumber.startsWith('+') ? order.phoneNumber : `+${order.phoneNumber}`}
                           </div>
                           <button 
                             onClick={() => copyToClipboard(order.phoneNumber.startsWith('+') ? order.phoneNumber : `+${order.phoneNumber}`)} 
                             className={`p-1.5 rounded-lg transition-colors ${d('text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50', 'text-[#8B949E] hover:text-[#4648d4] bg-[#21262D] hover:bg-[#30363D]')}`}
                             title={t('db_kopyala_tooltip')}
                           >
                             <Copy className="h-3.5 w-3.5" />
                           </button>
                         </div>

                         {/* Remaining time countdown badge */}
                         <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black border tracking-wider font-mono ${
                           d('bg-rose-50 border-rose-100 text-rose-600', 'bg-rose-950/20 border-rose-900/40 text-rose-400')
                         }`}>
                           <Clock className="h-3.5 w-3.5 animate-pulse" />
                           <span>{getRemainingTimeText(order.createdAt)}</span>
                         </div>
                       </div>
                       
                       {order.status === 'PENDING' && order.smsCode ? (
                          <div className="space-y-3">
                            <div className={`p-2.5 rounded-xl text-center shadow-xs border ${d('bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200', 'bg-[#0D1117] border-emerald-900/50')}`}>
                              <span className={`text-[10px] font-bold uppercase block mb-0.5 ${d('text-emerald-600', 'text-emerald-400')}`}>
                                {language === 'tr' ? 'Onay Kodu' : language === 'az' ? 'Təsdiq Kodu' : 'Verification Code'}
                              </span>
                              <span className={`text-2xl font-black tracking-widest display-font ${d('text-emerald-700', 'text-emerald-300')}`}>{order.smsCode}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleFinishOrder(order.id)}
                                className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                                title="İşlemi onaylayıp kapatır"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                <span>{t('db_tamamla')}</span>
                              </button>
                              <button
                                onClick={() => handleResendSms(order.id)}
                                className={`flex-1 py-2 px-3 text-[11px] font-bold rounded-xl transition-all duration-300 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group/btn ${d('bg-indigo-600 hover:bg-indigo-500 text-white', 'bg-[#30363D] hover:bg-[#484F58] text-[#E6EDF3]')}`}
                                title="Yeni SMS kodu talep eder (Bize Özel)"
                              >
                                <div className="flex items-center gap-1">
                                  <RefreshCw className="h-3 w-3 shrink-0 group-hover/btn:rotate-180 transition-transform duration-500" />
                                  <span>{t('db_tekrar_kod')}</span>
                                </div>
                                <span className="text-[7px] text-teal-300 font-black tracking-wider mt-0.5">BİZE ÖZEL ✨</span>
                              </button>
                            </div>
                            <p className={`text-[9px] font-bold text-center py-1 px-2 rounded-lg border leading-relaxed ${d('text-slate-400 bg-slate-50/50 border-slate-100/50', 'text-[#8B949E] bg-[#0D1117]/50 border-[#30363D]')}`}>
                              ✨ {language === 'tr' 
                                ? "Bu özellik sadece OnayTR'de mevcuttur! Satın aldığınız numara online kaldığı sürece (20 dk) ek ücret ödemeden dilediğiniz kadar tekrar kod talep edebilirsiniz."
                                : language === 'az'
                                ? "Bu xüsusiyyət yalnız OnayTR-də mövcuddur! Satın aldığınız nömrə onlayn qaldığı müddətdə (20 dəq) əlavə ödəniş etmədən istədiyiniz qədər təkrar kod tələb edə bilərsiniz."
                                : "This feature is exclusive to OnayTR! As long as your purchased number remains online (20 min), you can request new codes as many times as you like at no extra charge."
                              }
                            </p>
                          </div>
                        ) : order.status === 'PENDING' ? (
                          <div className={`rounded-xl p-3 flex items-center justify-center gap-2.5 text-xs font-black border animate-glow-pulse ${d('bg-indigo-50/50 border-indigo-100/50 text-indigo-750', 'bg-indigo-950/20 border-indigo-900/30 text-indigo-400')}`}>
                            <div className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </div>
                            <span>{t('db_kod_bekleniyor')}</span>
                          </div>
                        ) : order.status === 'COMPLETED' && order.smsCode ? (
                          <div className="mt-2 p-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg text-center">
                            <span className="text-[10px] text-emerald-600 font-bold uppercase block mb-0.5">
                              {language === 'tr' ? 'Onay Kodu' : language === 'az' ? 'Təsdiq Kodu' : 'Verification Code'}
                            </span>
                            <span className="text-2xl font-black text-emerald-700 tracking-widest display-font">{order.smsCode}</span>
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 font-medium">
                            {language === 'tr' ? 'İşlem Sonlandı.' : language === 'az' ? 'Əməliyyat Bitdi.' : 'Transaction Ended.'}
                          </div>
                        )}
                     </div>
                  ))}
               </div>
             )}
          </div>
          
          <div className={`p-5 border-t backdrop-blur-md mt-auto ${d('border-white/40 bg-white/30', 'border-[#21262D] bg-[#0D1117]/30')}`}>
            <button onClick={() => router.push('/numbers')} className={`w-full flex items-center justify-center gap-2 border shadow-sm text-[15px] font-bold py-3.5 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 group ${d('bg-white/80 hover:bg-white border-white/80 text-slate-700', 'bg-[#21262D] hover:bg-[#30363D] border-[#30363D] text-[#E6EDF3]')}`}>
              <ListOrdered className="h-4.5 w-4.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              {t('nav_numaralarim')}
            </button>
          </div>
        </div>

        {/* COLUMN 2: Uygulama Seçin */}
        <div className={`w-full lg:w-1/3 flex flex-col overflow-hidden h-[800px] transition-all duration-300 hover:-translate-y-1 rounded-2xl border backdrop-blur-xl shadow-lg ${d('bg-white/60 border-white/40', 'bg-[#161B22]/90 border-[#30363D]')}`}>
          <div className={`px-6 py-5 flex items-center gap-3 border-b ${d('bg-white/30 border-white/30', 'bg-[#0D1117]/50 border-[#21262D]')}`}>
             <div className={`h-8 w-8 rounded-full flex items-center justify-center text-indigo-600 ${d('bg-indigo-50', 'bg-indigo-950/20')}`}>
              <Smartphone className="h-4 w-4" />
            </div>
            <span className={`font-extrabold text-lg display-font ${d('text-slate-800', 'text-[#E6EDF3]')}`}>
              {language === 'tr' ? 'Uygulama Seçin' : language === 'az' ? 'Tətbiq Seçin' : 'Select Application'}
            </span>
          </div>
          
          <div className="p-5 flex flex-col flex-1 min-h-0">
            <div className="relative mb-5 group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4648d4] to-[#712ae2] rounded-xl opacity-0 group-focus-within:opacity-30 blur transition-opacity duration-300"></div>
              <input 
                type="text" 
                placeholder={language === 'tr' ? 'Uygulama Ara (örn: Whatsapp)' : language === 'az' ? 'Tətbiq Axtar (məs: Whatsapp)' : 'Search App (e.g. Whatsapp)'} 
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                className={`relative w-full backdrop-blur-md border shadow-sm text-[15px] font-medium rounded-xl pl-4 pr-11 py-3.5 focus:outline-none focus:border-indigo-500 transition-all ${d('bg-white/70 border-white text-slate-800 focus:bg-white placeholder:text-slate-400', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3] focus:bg-[#0D1117] placeholder:text-[#484F58]')}`} 
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            </div>

            {/* Favoriler & Son Kullanılanlar hızlı erişim */}
            {(favorites.length > 0 || recents.length > 0) && (
              <div className="mb-4">
                {favorites.length > 0 && (
                  <div className="mb-3">
                    <div className={`flex items-center gap-1.5 mb-2 text-xs font-black uppercase tracking-wider ${d('text-rose-500', 'text-rose-400')}`}>
                      <Heart className="h-3 w-3 fill-rose-500" /> {t('db_favorilerim')}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {favorites.slice(0, 6).map((fav, i) => (
                        <button
                          key={i}
                          onClick={() => { setSelectedApp(fav.serviceCode); setSelectedCountry(fav.countryCode); }}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-105 ${d('bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100', 'bg-rose-900/20 border-rose-800/40 text-rose-400 hover:bg-rose-900/40')}`}
                        >
                          <AppLogo name={fav.serviceCode} className="h-4 w-4" />
                          <span className="capitalize">{fav.serviceCode}</span>
                           <span className="opacity-60 capitalize">/{fav.countryCode}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {recents.length > 0 && (
                  <div>
                    <div className={`flex items-center gap-1.5 mb-2 text-xs font-black uppercase tracking-wider ${d('text-slate-400', 'text-[#484F58]')}`}>
                      <History className="h-3 w-3" /> {t('db_son_kullanilanlar')}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recents.slice(0, 6).map((r, i) => (
                        <button
                          key={i}
                          onClick={() => { setSelectedApp(r.serviceCode); setSelectedCountry(r.countryCode); }}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all hover:scale-105 ${d('bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100', 'bg-[#21262D] border-[#30363D] text-[#8B949E] hover:bg-[#30363D]')}`}
                        >
                          <AppLogo name={r.serviceCode} className="h-4 w-4" />
                          <span className="capitalize">{r.serviceCode}</span>
                           <span className="opacity-60 capitalize">/{r.countryCode}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* App Grid */}
            <div className="grid grid-cols-2 gap-3 items-start overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
              {isLoading ? (
                <div className="col-span-2 flex justify-center py-10"><Loader2 className="h-8 w-8 text-indigo-500 animate-spin" /></div>
              ) : filteredApps.length === 0 ? (
                <div className="col-span-2 text-center py-10 text-slate-500">
                  {language === 'tr' ? 'Uygulama bulunamadı' : language === 'az' ? 'Tətbiq tapılmadı' : 'No applications found'}
                </div>
              ) : (
                filteredApps.map((app: any, idx: number) => {
                  const isActive = selectedApp === app.name;
                  
                  return (
                    <button 
                      key={app.name} 
                      onClick={() => { setSelectedApp(app.name); setSelectedCountry(null); }}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 ${
                        isActive 
                          ? isDark 
                            ? 'bg-indigo-950/30 border-indigo-700/50 text-indigo-400 shadow-[0_8px_16px_rgba(70,72,212,0.2)] ring-1 ring-indigo-500/30'
                            : 'bg-gradient-to-br from-indigo-50 to-white border-indigo-300 text-indigo-900 shadow-[0_8px_16px_rgba(70,72,212,0.1)] ring-1 ring-indigo-400/50' 
                          : isDark
                            ? 'bg-[#21262D]/70 border-[#30363D] text-[#E6EDF3] hover:border-indigo-700/40 hover:shadow-lg hover:bg-[#21262D] shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                            : 'bg-white/50 border-white/80 text-slate-700 hover:border-indigo-200 hover:shadow-lg hover:bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
                      }`}
                    >
                      <AppLogo name={app.name} className="h-10 w-10" key={app.name} />
                      <div className="flex flex-col items-start overflow-hidden">
                        <span className={`text-[14px] capitalize truncate w-full text-left ${isActive ? 'font-extrabold' : 'font-bold'}`}>
                          {app.displayName || app.name}
                        </span>
                        <span className={`text-[10px] font-medium ${d('text-slate-400', 'text-[#484F58]')}`}>{app.minPrice} {language === 'tr' ? "₺'den başlar" : language === 'az' ? "₺-dan başlayır" : "₺ starts from"}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* COLUMN 3: Ülke Seçin */}
        <div className={`w-full lg:w-1/3 flex flex-col overflow-hidden h-[800px] transition-all duration-300 hover:-translate-y-1 rounded-2xl border backdrop-blur-xl shadow-lg ${d('bg-white/60 border-white/40', 'bg-[#161B22]/90 border-[#30363D]')}`}>
          <div className={`px-6 py-5 flex items-center gap-3 border-b ${d('bg-white/30 border-white/30', 'bg-[#0D1117]/50 border-[#21262D]')}`}>
             <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[#712ae2] ${d('bg-purple-100/10', 'bg-purple-950/20')}`}>
              <Globe className="h-4 w-4" />
            </div>
            <span className={`font-extrabold text-lg display-font ${d('text-slate-800', 'text-[#E6EDF3]')}`}>
              {language === 'tr' ? 'Ülke Seçin' : language === 'az' ? 'Ölkə Seçin' : 'Select Country'}
            </span>
          </div>

          <div className={`p-5 flex-1 flex flex-col min-h-0 ${d('bg-gradient-to-b from-indigo-50/10 to-transparent', '')}`}>
             
             {/* Selected Service Info Display Card (from Screenshot 1) */}
             {selectedApp && (
               <div className={`rounded-2xl p-4 mb-5 border relative overflow-hidden shadow-sm flex flex-col gap-3.5 ${d('bg-white/80 border-indigo-100/60', 'bg-[#21262D] border-[#30363D]')}`}>
                  <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-400/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                  
                  {/* Row 1: Selected App & Tüm Servisler Link */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2.5">
                      <AppLogo name={selectedApp} className="h-7 w-7" key={selectedApp} />
                      <span className={`font-extrabold text-base display-font tracking-tight capitalize ${d('text-slate-800', 'text-[#E6EDF3]')}`}>
                        {selectedApp}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedApp(null)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${d('bg-slate-100/80 hover:bg-slate-200/80 text-slate-600', 'bg-[#30363D] hover:bg-[#484F58] text-[#E6EDF3]')}`}
                    >
                      <Smartphone className="h-3.5 w-3.5 text-indigo-500" />
                      <span>{language === 'tr' ? 'Tüm Servisler' : language === 'az' ? 'Bütün Servislər' : 'All Services'}</span>
                    </button>
                  </div>
                  
                  {/* Row 2: Full Width Recommended Operators Button (Proxy AL removed) */}
                  <div className="flex relative z-10">
                    <button
                      onClick={() => setIsRecommendModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.3)] active:scale-[0.98]"
                    >
                      <Award className="h-4 w-4 shrink-0 text-amber-400 animate-bounce" />
                      <span>{language === 'tr' ? 'Tavsiye Edilen Operatörler' : language === 'az' ? 'Tövsiyə Edilən Operatorlar' : 'Recommended Operators'}</span>
                    </button>
                  </div>
               </div>
             )}

             <div className="flex gap-2 mb-5">
                <div className="relative flex-1 group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-blue-400 rounded-xl opacity-0 group-focus-within:opacity-30 blur transition-opacity duration-300"></div>
                  <input 
                                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className={`relative w-full backdrop-blur-md border shadow-sm text-[14px] font-medium rounded-xl pl-4 pr-11 py-3.5 focus:outline-none focus:border-indigo-500 transition-all ${d('bg-white/80 border-white text-slate-800 focus:bg-white placeholder:text-slate-400', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3] focus:bg-[#0D1117] placeholder:text-[#484F58]')}`} 
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
                
                <select 
                  value={`${countrySort}-${sortDirection}`}
                  onChange={(e) => {
                    const [sort, dir] = e.target.value.split('-');
                    setCountrySort(sort as any);
                    setSortDirection(dir as any);
                  }}
                  className={`backdrop-blur-md border shadow-sm text-[13px] font-bold rounded-xl px-3 py-3.5 focus:outline-none focus:border-indigo-500 cursor-pointer transition-all ${d('bg-white/80 border-white text-slate-700 focus:bg-white', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3] focus:bg-[#0D1117]')}`}
                >
                  <option value="stock-desc">{language === 'tr' ? 'En Çok Stok' : language === 'az' ? 'Ən Çox Stok' : 'Max Stock'}</option>
                  <option value="stock-asc">{language === 'tr' ? 'En Az Stok' : language === 'az' ? 'Ən Az Stok' : 'Min Stock'}</option>
                  <option value="price-asc">{language === 'tr' ? 'En Ucuz' : language === 'az' ? 'Ən Ucuz' : 'Cheapest'}</option>
                  <option value="price-desc">{language === 'tr' ? 'En Pahalı' : language === 'az' ? 'Ən Bahalı' : 'Most Expensive'}</option>
                  <option value="name-asc">{language === 'tr' ? 'A-Z Sırala' : language === 'az' ? 'A-Z Sırala' : 'Sort A-Z'}</option>
                  <option value="name-desc">{language === 'tr' ? 'Z-A Sırala' : language === 'az' ? 'Z-A Sırala' : 'Sort Z-A'}</option>
                </select>
             </div>

              {/* Country List or Operators List */}
              <div className="flex flex-col gap-2.5 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
                {isLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 text-indigo-500 animate-spin" /></div>
                ) : !selectedApp ? (
                  <div className="text-center py-10 text-slate-500 font-medium flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 opacity-50" />
                    <p>
                      {language === 'tr' ? 'Lütfen işlem yapmak için önce sol taraftan bir servis/uygulama seçin.' : language === 'az' ? 'Zəhmət olmasa əməliyyat etmək üçün əvvəlcə sol tərəfdən xidmət seçin.' : 'Please select a service/application from the left side first.'}
                    </p>
                  </div>
                ) : selectedCountry && selectedServiceDetails ? (
                  <div className="flex flex-col gap-2.5">
                    <button onClick={() => setSelectedCountry(null)} className="text-indigo-600 dark:text-indigo-400 text-sm font-bold flex items-center gap-1 mb-2 hover:underline self-start">
                      &larr; {language === 'tr' ? 'Ülke Listesine Dön' : language === 'az' ? 'Ölkə Siyahısına Qayıt' : 'Back to Countries'}
                    </button>
                    <h3 className={`font-bold text-lg display-font capitalize ${d('text-slate-800', 'text-[#E6EDF3]')}`}>
                      {getCountryName(selectedCountry, selectedCountry, language)} {(countryCallingCodes[selectedCountry.toLowerCase().replace(/[^a-z0-9]/g, '')] || '')} — {language === 'tr' ? 'Fiyat Seçenekleri' : language === 'az' ? 'Qiymət Seçimləri' : 'Price Options'}
                    </h3>
                    {successRate !== null && (
                       <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold mb-2 ${
                         successRate >= 80 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                         successRate >= 50 ? 'bg-amber-50 border-amber-200 text-amber-700' :
                         'bg-rose-50 border-rose-200 text-rose-700'
                       }`}>
                         <span className={`h-2 w-2 rounded-full ${
                           successRate >= 80 ? 'bg-emerald-500' : successRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                         }`}></span>
                         {language === 'tr' ? 'Başarı Oranı' : language === 'az' ? 'Uğur Nisbəti' : 'Success Rate'}: <strong>%{successRate}</strong> <span className="font-normal opacity-70">({language === 'tr' ? 'son 7 gün' : language === 'az' ? 'son 7 gün' : 'last 7 days'})</span>
                       </div>
                    )}
                    <p className={`text-xs font-medium -mt-1 mb-1 ${d('text-slate-500', 'text-[#8B949E]')}`}>
                      {language === 'tr' ? 'Ucuzdan pahalıya sıralanmıştır. Satın almak istediğiniz fiyat kademesini seçin.' : language === 'az' ? 'Ucuzdan bahalıya sıralanıb. Satın almaq istədiyiniz qiymət mərhələsini seçin.' : 'Sorted from cheapest to most expensive. Choose your preferred price tier.'}
                    </p>
                    
                    {(!selectedServiceDetails.operators || Object.keys(selectedServiceDetails.operators).length === 0) ? (
                      <div className="text-center py-10 text-slate-500 font-medium">
                        {language === 'tr' ? 'Bu servis için bu ülkede aktif operatör bulunamadı.' : language === 'az' ? 'Bu xidmət üçün bu ölkədə aktiv operator tapılmadı.' : 'No active operators found for this service in this country.'}
                      </div>
                    ) : (
                      Object.entries(selectedServiceDetails.operators)
                        .sort((a: any, b: any) => a[1].priceTry - b[1].priceTry)
                        .map(([opKey, opData]: any, idx) => {
                          const isFirst = idx === 0;
                          const hasAnyOperator = Object.values(selectedServiceDetails.operators).some((op: any) => op.operator === 'any');

                        return (
                          <div key={opKey} className={`border rounded-2xl p-4 flex items-center justify-between shadow-sm animate-fade-in transition-all hover:shadow-md mb-2.5 ${
                            isFirst 
                              ? isDark ? 'bg-emerald-950/20 border-emerald-700/40 ring-1 ring-emerald-600/30' : 'bg-white border-emerald-200 ring-1 ring-emerald-300/50'
                              : isDark ? 'bg-[#161B22] border-[#30363D]' : 'bg-white border-slate-100'
                          }`}>
                            <div className="flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-full shrink-0 flex items-center justify-center font-black text-sm ${
                                isFirst 
                                  ? isDark ? 'bg-emerald-900/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                  : isDark ? 'bg-[#21262D] text-[#8B949E]' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {idx + 1}
                              </div>
                              
                              {/* Country Flag next to operator */}
                              <div className={`h-6 w-6 rounded-full overflow-hidden border shrink-0 relative flex items-center justify-center shadow-3xs ${d('border-slate-200/60 bg-slate-50', 'border-[#30363D] bg-[#161B22]')}`}>
                                <span className={`fi fi-${getCountryFlagCode(pricingData?.countries?.find((c: any) => c.code === selectedCountry)?.flagCode || selectedCountry)} !w-full !h-full rounded-full absolute inset-0 !bg-cover !bg-center`} />
                              </div>
                              
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[13px] font-extrabold ${d('text-slate-800', 'text-[#E6EDF3]')}`}>
                                    {opData.operator === 'any'
                                      ? (language === 'tr' ? 'En Ucuz Operatör (Otomatik)' : language === 'az' ? 'Ən Ucuz Operator (Avtomatik)' : 'Cheapest Operator (Auto)')
                                      : `${language === 'tr' ? 'Operatör' : language === 'az' ? 'Operator' : 'Operator'} ${hasAnyOperator ? idx : idx + 1}`}
                                  </span>
                                  
                                  {isFirst && (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                      {language === 'tr' ? 'En Ucuz' : language === 'az' ? 'Ən Ucuz' : 'Cheapest'} 🏷️
                                    </span>
                                  )}

                                  {opData.provider === 'herosms' && (
                                    <div className="relative group/tooltip">
                                      <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border cursor-help select-none ${d('bg-blue-50 border-blue-200 text-blue-600', 'bg-blue-950/30 border-blue-900/40 text-blue-400')}`}>
                                        <RefreshCw className="h-2.5 w-2.5 group-hover/tooltip:rotate-180 transition-transform duration-500" />
                                        <span>SMS</span>
                                      </span>
                                      
                                      {/* Tooltip */}
                                      <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover/tooltip:block w-64 p-3 rounded-2xl border shadow-xl z-[60] leading-relaxed text-[11px] text-left font-normal ${d('bg-slate-900 text-white border-slate-800', 'bg-[#161B22] text-[#E6EDF3] border-[#30363D]')}`}>
                                        <div className={`absolute left-1/2 -translate-x-1/2 top-[-4px] w-2 h-2 rotate-45 border-t border-l ${d('bg-slate-900 border-slate-800', 'bg-[#161B22] border-[#30363D]')}`}></div>
                                        <p className="font-extrabold mb-1 flex items-center gap-1.5 text-blue-400">
                                          <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                                          {language === 'tr' ? 'Tekrar SMS Desteği' : language === 'az' ? 'Təkrar SMS Dəstəyi' : 'Resend SMS Support'}
                                        </p>
                                        <p className="opacity-90">
                                          {language === 'tr' 
                                            ? "Bu operatörden 20 dakika boyunca hiçbir ek ücret ödemeden dilediğiniz kadar tekrar doğrulama kodu alabilirsiniz."
                                            : language === 'az'
                                            ? "Bu operatordan 20 dəqiqə ərzində heç bir əlavə ödəniş etmədən istədiyiniz qədər təkrar təsdiq kodu ala bilərsiniz."
                                            : "You can receive as many verification codes as you like from this operator for 20 minutes at no extra charge."
                                          }
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[11px] text-slate-500 font-medium">
                                    {opData.count.toLocaleString('tr-TR')} {language === 'tr' ? 'stok' : language === 'az' ? 'stok' : 'stock'}
                                  </span>
                                  {renderSignalBars(opData.count)}
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleBuy(opKey)}
                              disabled={isBuying}
                              className={`font-bold py-2 px-5 rounded-xl transition-all duration-300 flex items-center gap-2 text-white shadow-md disabled:opacity-50 hover:scale-[1.03] ${
                                isFirst 
                                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_4px_12px_rgba(5,150,105,0.3)]' 
                                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_4px_12px_rgba(70,72,212,0.25)]'
                              }`}
                            >
                              {isBuying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                              <span className="font-black">{opData.priceTry} ₺</span>
                              <span className="text-white/70 text-xs font-black">
                                {language === 'tr' ? 'Al' : language === 'az' ? 'Al' : 'Buy'}
                              </span>
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
              // SHOW COUNTRIES (SORTED AND FILTERED)
              sortedCountries.map((country: any, idx: number) => {
                const countryAppDetails = pricingData?.detailedPricing[country.code][selectedApp];
                if (!countryAppDetails) return null;
 
                const callingCode = countryCallingCodes[country.code.toLowerCase().replace(/[^a-z0-9]/g, '')] || '';
                const operators = Object.values(countryAppDetails.operators || {}) as any[];
                const operatorCount = operators.length;
                const maxPrice = operators.length > 0 
                  ? Math.max(...operators.map((op: any) => op.priceTry)) 
                  : countryAppDetails.minPrice;
 
                return (
                  <div key={idx} onClick={() => setSelectedCountry(country.code)} className={`rounded-2xl p-3 flex items-center transition-all duration-300 cursor-pointer group transform hover:-translate-y-0.5 border ${d('bg-white/60 border-white/80 hover:bg-white hover:shadow-md', 'bg-[#21262D]/60 border-[#30363D] hover:bg-[#21262D] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]')}`}>
                     <div className={`h-10 w-10 rounded-full overflow-hidden border shrink-0 group-hover:scale-105 transition-transform shadow-sm relative flex items-center justify-center ${d('border-slate-200/50 bg-slate-50', 'border-[#30363D] bg-[#161B22]')}`}>
                       <span className={`fi fi-${getCountryFlagCode(country.flagCode || country.code)} !w-full !h-full rounded-full absolute inset-0 !bg-cover !bg-center`} />
                     </div>
                     <div className="ml-3 flex flex-col items-start overflow-hidden flex-1">
                        <span className={`text-[15px] font-bold truncate display-font capitalize ${d('text-slate-800', 'text-[#E6EDF3]')}`}>
                          {getCountryName(country.code, country.name, language)} {callingCode ? `(${callingCode})` : ''}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                           <span className={`text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm border ${d('bg-indigo-50/50 border-indigo-100/50 text-indigo-700', 'bg-indigo-950/20 border-indigo-900/30 text-indigo-400')}`}>
                             {operatorCount} {language === 'tr' ? 'seçenek' : language === 'az' ? 'seçim' : 'options'}
                           </span>
                           {operators.some((op: any) => op.provider === 'herosms') && (
                             <span 
                               className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border shadow-sm ${d('bg-blue-50 border-blue-200 text-blue-600', 'bg-blue-950/20 border-blue-900/30 text-blue-400')}`}
                               title={language === 'tr' ? 'Bu ülkede tekrar SMS desteği olan operatör mevcut' : language === 'az' ? 'Bu ölkədə təkrar SMS dəstəyi olan operator mövcuddur' : 'An operator with resend SMS support is available in this country'}
                             >
                               <RefreshCw className="h-2 w-2" />
                               SMS
                              </span>
                            )}
                           {renderSignalBars(countryAppDetails.totalCount)}
                        </div>
                     </div>
                     <div className="flex flex-col items-end shrink-0 px-3">
                        <span className={`text-[13px] font-black leading-tight ${d('text-emerald-600', 'text-emerald-400')}`}>{countryAppDetails.minPrice} ₺</span>
                        {operatorCount > 1 && maxPrice !== countryAppDetails.minPrice && (
                          <span className={`text-[11px] font-bold leading-tight ${d('text-slate-400', 'text-[#484F58]')}`}>{maxPrice.toFixed(2)} ₺</span>
                        )}
                     </div>
                     <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedApp!, country.code); }}
                        disabled={favTogglingKey === `${selectedApp}-${country.code}`}
                        className={`h-8 w-8 rounded-full flex items-center justify-center transition-all mr-1 shrink-0 ${
                          isFavorite(selectedApp!, country.code)
                            ? 'bg-rose-100 text-rose-500 hover:bg-rose-200'
                            : d('bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-400', 'bg-[#21262D] text-[#484F58] hover:bg-rose-900/30 hover:text-rose-400')
                        }`}
                        title={isFavorite(selectedApp!, country.code) ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isFavorite(selectedApp!, country.code) ? 'fill-rose-500' : ''}`} />
                      </button>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white text-indigo-650 transition-colors ${d('bg-indigo-50/50', 'bg-indigo-950/20')}`}>
                        <ChevronDown className="h-4 w-4 shrink-0 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                  </div>
                );
              }))}
             </div>
          </div>
        </div>
      </div>

      {/* Recommended Services Modal */}
      {isRecommendModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div 
            onClick={() => setIsRecommendModalOpen(false)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300"
          ></div>
          
          {/* Card Container */}
          <div className={`relative w-full max-w-4xl rounded-3xl border shadow-2xl transition-all transform scale-100 flex flex-col max-h-[90vh] overflow-hidden ${d('bg-white border-slate-200/80 shadow-slate-200/40', 'bg-[#161B22] border-[#30363D]/80 shadow-black/80')}`}>
            {/* Top Accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600"></div>
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100/10 shrink-0 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl flex items-center justify-center text-indigo-600 shadow-[0_4px_12px_rgba(79,70,229,0.15)] ${d('bg-indigo-50 border border-indigo-100', 'bg-indigo-950/20 border border-indigo-900/30')}`}>
                  <Award className="h-5 w-5 animate-pulse" />
                </div>
                <div className="text-left">
                  <h3 className={`text-xl font-black display-font tracking-tight ${d('text-slate-800', 'text-[#E6EDF3]')}`}>
                    {language === 'tr' ? 'Tavsiye Edilen Operatörler' : language === 'az' ? 'Tövsiyə Edilən Operatorlar' : 'Recommended Operators'}
                  </h3>
                  <p className={`text-[10px] font-black tracking-wider uppercase ${d('text-slate-400', 'text-[#8B949E]')}`}>
                    {language === 'tr' 
                      ? "En yüksek başarılı SMS performansına sahip operatörlerin listesi" 
                      : language === 'az'
                      ? "Ən yüksək uğurlu SMS performansına malik operatorların siyahısı"
                      : "List of operators with the highest successful SMS performance"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsRecommendModalOpen(false)}
                className={`p-2.5 rounded-xl transition-all duration-200 ${d('hover:bg-slate-100 text-slate-400 hover:text-slate-600', 'hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3]')}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Modal Content Grid (Broken Symmetry) */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative z-10 min-h-0">
              {isLoadingRecommendations ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                  <span className="text-xs text-slate-400 font-extrabold tracking-wider uppercase">
                    {language === 'tr' ? 'İstatistikler Hesaplanıyor...' : language === 'az' ? 'Statistikalar Hesablanır...' : 'Calculating Statistics...'}
                  </span>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="text-center py-20 text-slate-400 font-bold">
                  {language === 'tr' ? 'Tavsiye servis verisi bulunamadı.' : language === 'az' ? 'Tövsiyə edilən servis tapılmadı.' : 'No recommendation data found.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* Left: Hero Card (Rank #1) */}
                  <div className={`lg:col-span-2 flex flex-col justify-between p-6 rounded-3xl border relative overflow-hidden transition-all hover:shadow-lg ${d('bg-indigo-50/30 border-indigo-100/80 shadow-sm', 'bg-indigo-950/5 border-indigo-900/20')}`}>
                    {/* Ribbon */}
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-amber-400 text-slate-900 flex items-center gap-1 shadow-sm">
                      <Award className="h-3.5 w-3.5" />
                      <span>EN YÜKSEK SKOR</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="text-left mt-2">
                        <span className={`text-[11px] font-black uppercase tracking-wider text-indigo-500`}>LİDER OPERATÖR</span>
                        <h4 className={`text-2xl font-black display-font mt-1 leading-tight capitalize ${d('text-slate-800', 'text-[#E6EDF3]')}`}>
                          {getCountryName(recommendations[0].countryCode, recommendations[0].countryName, language)}
                        </h4>
                        <p className="text-xs text-slate-400 font-bold mt-1">
                          {language === 'tr' ? 'Operatör' : language === 'az' ? 'Operator' : 'Operator'} {recommendations[0].operator.toUpperCase()} {countryCallingCodes[recommendations[0].countryCode.toLowerCase().replace(/[^a-z0-9]/g, '')] ? `(${countryCallingCodes[recommendations[0].countryCode.toLowerCase().replace(/[^a-z0-9]/g, '')]})` : ''}
                        </p>
                      </div>

                      {/* Large Flag & Glow */}
                      <div className="flex justify-start py-4">
                        <div className={`h-20 w-20 rounded-full overflow-hidden border shrink-0 relative flex items-center justify-center shadow-lg ring-4 ring-amber-400/80 ring-offset-4 ${d('border-slate-200/50 bg-slate-50 ring-offset-white', 'border-[#30363D] bg-[#161B22] ring-offset-[#161B22]')}`}>
                          <span className={`fi fi-${getCountryFlagCode(recommendations[0].flagCode || recommendations[0].countryCode)} !w-full !h-full rounded-full absolute inset-0 !bg-cover !bg-center`} />
                        </div>
                      </div>

                      {/* Success stats */}
                      <div className="text-left">
                        <span className="text-[11px] font-black text-slate-400 tracking-wider block uppercase">ORTALAMA SMS BAŞARI ORANI</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-4xl font-black text-emerald-600 display-font">%{recommendations[0].rate}</span>
                          <span className="text-xs text-slate-400 font-bold">başarılı teslimat</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCountry(recommendations[0].countryCode);
                        setIsRecommendModalOpen(false);
                        showToast(`${getCountryName(recommendations[0].countryCode, recommendations[0].countryName, language)} seçildi!`, 'success');
                      }}
                      className="w-full mt-6 py-3 px-5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-black rounded-xl transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2"
                    >
                      <span>{language === 'tr' ? 'Hemen Bu Servise Git' : language === 'az' ? 'Həmin Servisə Keç' : 'Go to This Service'}</span>
                      <span className="font-extrabold text-sm">&rarr;</span>
                    </button>
                  </div>

                  {/* Right: Other Rankings Table */}
                  <div className="lg:col-span-3 flex flex-col justify-between">
                    <div className="space-y-3.5">
                      <span className="text-xs font-black uppercase text-slate-400 tracking-wider block text-left mb-2">DİĞER YÜKSEK PERFORMANSLI ROTALAR</span>
                      <div className="space-y-2.5">
                        {recommendations.slice(1).map((item: any, idx: number) => {
                          const callingCode = countryCallingCodes[item.countryCode.toLowerCase().replace(/[^a-z0-9]/g, '')] || '';
                          const countryNameText = getCountryName(item.countryCode, item.countryName, language);
                          const rank = idx + 2;

                          // Small rank badges
                          const rankBg = rank === 2 ? 'bg-slate-400 text-white shadow-sm ring-1 ring-slate-300' : 
                                         rank === 3 ? 'bg-amber-700 text-white shadow-sm ring-1 ring-amber-600' : 
                                         d('bg-slate-100 text-slate-500', 'bg-[#21262D] text-[#8B949E]');

                          return (
                            <div 
                              key={idx}
                              className={`flex items-center justify-between p-3 border rounded-2xl transition-all duration-200 hover:scale-[1.01] ${d('bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm', 'bg-[#21262D]/40 border-[#30363D] hover:bg-[#21262D]/60 hover:border-[#484F58]/50')}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`h-6.5 w-6.5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black ${rankBg}`}>
                                  #{rank}
                                </div>
                                <div className={`h-7 w-7 rounded-full overflow-hidden border shrink-0 relative flex items-center justify-center shadow-2xs ${d('border-slate-200/50 bg-slate-50', 'border-[#30363D] bg-[#161B22]')}`}>
                                  <span className={`fi fi-${getCountryFlagCode(item.flagCode || item.countryCode)} !w-full !h-full rounded-full absolute inset-0 !bg-cover !bg-center`} />
                                </div>
                                <div className="flex flex-col text-left">
                                  <span className={`text-[12.5px] font-extrabold tracking-tight ${d('text-slate-800', 'text-[#E6EDF3]')}`}>
                                    {countryNameText} {callingCode ? `(${callingCode})` : ''}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-bold -mt-0.5">
                                    {language === 'tr' ? 'Operatör' : language === 'az' ? 'Operator' : 'Operator'} {item.operator.toUpperCase()}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end shrink-0">
                                  <span className={`text-xs font-black ${item.rate >= 50 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    %{item.rate} Başarı
                                  </span>
                                  <div className="w-14 h-1 bg-slate-100 dark:bg-[#0D1117] rounded-full overflow-hidden mt-0.5 border border-slate-200/10 dark:border-[#30363D]/20">
                                    <div 
                                      className={`h-full rounded-full ${item.rate >= 50 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                      style={{ width: `${item.rate}%` }}
                                    ></div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => {
                                    setSelectedCountry(item.countryCode);
                                    setIsRecommendModalOpen(false);
                                    showToast(`${countryNameText} seçildi!`, 'success');
                                  }}
                                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${d('bg-indigo-50 text-indigo-600 hover:bg-indigo-100', 'bg-indigo-950/20 text-indigo-400 hover:bg-indigo-900/30')}`}
                                  title={language === 'tr' ? 'Git' : 'Go'}
                                >
                                  <span className="font-bold text-sm leading-none">&rarr;</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
