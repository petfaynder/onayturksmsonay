"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Clock, Smartphone, Phone, Search, AlertCircle, Loader2, CheckCircle2, ChevronDown, RefreshCw, Clipboard, ArrowRight, Globe, Bolt } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/AppLogo';
import { getCountryFlagCode } from '@/lib/utils/icons';
import { useToast } from '@/components/ToastProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { countryCallingCodes } from '@/lib/utils/countries';


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

const rentPeriods = [
  { label: '4 Saat', value: 4 },
  { label: '12 Saat', value: 12 },
  { label: '24 Saat (1 Gün)', value: 24 },
  { label: '72 Saat (3 Gün)', value: 72 },
  { label: '168 Saat (1 Hafta)', value: 168 }
];

export default function RentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const { showToast, showAlert, showConfirm } = useToast();
  const { t, language } = useLanguage();

  const [pricingData, setPricingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedApp, setSelectedApp] = useState<string | null>('whatsapp');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(24);
  const [appSearch, setAppSearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [countrySort, setCountrySort] = useState<'stock' | 'price' | 'name'>('stock');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Active Rent Orders
  const [rentOrders, setRentOrders] = useState<any[]>([]);
  const [isBuying, setIsBuying] = useState(false);
  const [isFetchingOrders, setIsFetchingOrders] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchPricing();
      fetchRentOrders();
    }
  }, [status]);

  // Polling rent orders for new SMS
  useEffect(() => {
    if (rentOrders.length === 0) return;

    const interval = setInterval(async () => {
      const activeRentals = rentOrders.filter(o => o.status === 'PENDING');
      if (activeRentals.length === 0) return;

      const updated = await Promise.all(
        rentOrders.map(async (order) => {
          if (order.status !== 'PENDING') return order;
          try {
            const res = await fetch(`/api/orders/check?orderId=${order.id}`);
            if (res.ok) {
              const data = await res.json();
              return { ...order, status: data.status, smsCode: data.smsCode };
            }
          } catch (e) {
            console.error(e);
          }
          return order;
        })
      );
      setRentOrders(updated);
    }, 15000); // Check every 15s

    return () => clearInterval(interval);
  }, [rentOrders]);  const fetchPricing = async () => {
    try {
      const res = await fetch('/api/pricing/rent', { cache: 'no-store' });
      if (!res.ok) throw new Error(language === 'tr' ? 'Kiralama fiyatları yüklenemedi.' : language === 'az' ? 'Kirayə qiymətləri yüklənə bilmədi.' : 'Failed to load rental prices.');
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

  const fetchRentOrders = async () => {
    try {
      const res = await fetch('/api/orders?type=RENT');
      if (res.ok) {
        const data = await res.json();
        setRentOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingOrders(false);
    }
  };

  const handleRent = async (operator: string) => {
    if (!selectedApp || !selectedCountry || !pricingData) return;
    if (!user) {
      showAlert(
        language === 'tr' ? 'Giriş Gerekli' : language === 'az' ? 'Giriş Lazımdır' : 'Login Required',
        language === 'tr' ? 'Lütfen işlem yapabilmek için önce giriş yapın.' : language === 'az' ? 'Zəhmət olmasa əməliyyat etmək üçün əvvəlcə daxil olun.' : 'Please log in first to make this transaction.',
        "warning"
      );
      return;
    }
    
    const provider = pricingData.prices[selectedCountry]?.[selectedApp]?.operators[operator];
    const unitPrice = provider?.priceTry || 0;
    const totalPrice = unitPrice * (selectedPeriod / 24);

    const confirmMsg = language === 'tr'
      ? `${selectedApp.toUpperCase()} servisi için ${selectedCountry.toUpperCase()} (${operator}) numarası ${selectedPeriod} saatliğine kiralanacaktır. Toplam Ücret: ${totalPrice.toFixed(2)} ₺. Onaylıyor musunuz?`
      : language === 'az'
      ? `${selectedApp.toUpperCase()} xidməti üçün ${selectedCountry.toUpperCase()} (${operator}) nömrəsi ${selectedPeriod} saatlıq kirayələnəcəkdir. Toplam Məbləğ: ${totalPrice.toFixed(2)} ₺. Təsdiqləyirsiniz?`
      : `The number for ${selectedCountry.toUpperCase()} (${operator}) will be rented for ${selectedPeriod} hours for the ${selectedApp.toUpperCase()} service. Total cost: ${totalPrice.toFixed(2)} ₺. Do you approve?`;

    showConfirm(
      language === 'tr' ? 'Numara Kirala' : language === 'az' ? 'Nömrə Kirayələ' : 'Rent Number',
      confirmMsg,
      async () => {
        setIsBuying(true);
        try {
          const res = await fetch('/api/orders/rent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              country: selectedCountry,
              operator: operator,
              product: selectedApp,
              hours: selectedPeriod
            })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || (language === 'tr' ? 'Kiralama işlemi başarısız.' : language === 'az' ? 'Kirayə əməliyyatı uğursuz oldu.' : 'Rental transaction failed.'));

          showToast(language === 'tr' ? 'Numara başarıyla kiralandı!' : language === 'az' ? 'Nömrə uğurla kirayələndi!' : 'Number rented successfully!', 'success');
          fetchRentOrders();
          router.refresh();
        } catch (err: any) {
          showAlert(language === 'tr' ? 'Hata' : language === 'az' ? 'Xəta' : 'Error', err.message, 'error');
        } finally {
          setIsBuying(false);
        }
      }
    );
  };

  // Helper to get remaining time formatted
  const getRemainingTime = (expiresAtStr: string) => {
    const diff = new Date(expiresAtStr).getTime() - Date.now();
    if (diff <= 0) return language === 'tr' ? 'Süresi Doldu' : language === 'az' ? 'Müddəti Bitdi' : 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}${language === 'tr' ? 'sa' : language === 'az' ? 'sa' : 'h'} ${mins}${language === 'tr' ? 'dk' : language === 'az' ? 'd' : 'm'}`;
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

  if (isLoading || status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <span className={`font-bold ${d('text-slate-500', 'text-slate-400')}`}>{language === 'tr' ? 'Kiralama verileri yükleniyor...' : language === 'az' ? 'Kirayə məlumatları yüklənir...' : 'Loading rental data...'}</span>
      </div>
    );
  }

  const filteredApps = pricingData?.apps?.filter((app: any) =>
    app.displayName.toLowerCase().includes(appSearch.toLowerCase())
  ) || [];

  const selectedCountryData = selectedApp && pricingData?.prices
    ? Object.keys(pricingData.prices).filter(cCode => pricingData.prices[cCode]?.[selectedApp])
    : [];

  const filteredCountries = pricingData?.countries?.filter((c: any) => {
    const callingCode = countryCallingCodes[c.code.toLowerCase().replace(/[^a-z0-9]/g, '')] || '';
    const matchesSearch = c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
                          callingCode.includes(countrySearch.toLowerCase()) ||
                          (countrySearch.replace('+', '').length > 0 && callingCode.includes(countrySearch.replace('+', '')));
    return selectedCountryData.includes(c.code) && matchesSearch;
  }) || [];

  const sortedCountries = [...filteredCountries].sort((a: any, b: any) => {
    if (!selectedApp) return 0;
    const aDetails = pricingData?.prices[a.code]?.[selectedApp];
    const bDetails = pricingData?.prices[b.code]?.[selectedApp];
    
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

  const operatorsData = selectedApp && selectedCountry && pricingData?.prices?.[selectedCountry]?.[selectedApp]?.operators
    ? Object.keys(pricingData.prices[selectedCountry][selectedApp].operators).map(opCode => ({
        code: opCode,
        ...pricingData.prices[selectedCountry][selectedApp].operators[opCode]
      }))
    : [];

  const localizedRentPeriods = [
    { label: language === 'tr' ? '24 Saat (1 Gün)' : language === 'az' ? '24 Saat (1 Gün)' : '24 Hours (1 Day)', value: 24 },
    { label: language === 'tr' ? '72 Saat (3 Gün)' : language === 'az' ? '72 Saat (3 Gün)' : '72 Hours (3 Days)', value: 72 },
    { label: language === 'tr' ? '168 Saat (1 Hafta)' : language === 'az' ? '168 Saat (1 Həftə)' : '168 Hours (1 Week)', value: 168 }
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        
        {/* Switcher */}
        <div className={`relative inline-grid grid-cols-2 items-center rounded-full p-1.5 mb-8 shadow-sm backdrop-blur-md border ${d('bg-white/40 border-white/60', 'bg-[#161B22]/60 border-[#30363D]')}`}>
          <button 
            onClick={() => router.push('/dashboard')}
            className={`w-full relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-[15px] font-bold transition-colors group ${d('text-slate-600 hover:text-indigo-750', 'text-[#8B949E] hover:text-indigo-400')}`}
          >
            <Bolt className="h-4 w-4 shrink-0" />
            <span>{t('nav_tek_kullanimlik')}</span>
          </button>
          <div className="absolute inset-y-1.5 right-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-[#4648d4] to-[#712ae2] rounded-full shadow-[0_4px_12px_rgba(70,72,212,0.25)] z-0 transition-transform duration-500"></div>
          <button className="w-full relative z-10 flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-[15px] font-bold text-white transition-colors">
            <span className="absolute -top-2 right-2 text-[9px] font-black text-white bg-gradient-to-r from-rose-500 to-pink-500 px-2 py-0.5 rounded-full shadow-md animate-bounce">{t('nav_yeni')}</span>
            <Clock className="h-4 w-4 shrink-0" />
            <span>{t('nav_kiralik')}</span>
          </button>
        </div>

        <h1 className={`text-4xl font-black display-font mb-2 relative drop-shadow-sm ${d('text-slate-800', 'text-[#E6EDF3]')}`}>
          <div className="absolute -inset-4 bg-indigo-400/10 blur-2xl rounded-full -z-10"></div>
          {language === 'tr' ? 'Süreli Numara Kiralama' : language === 'az' ? 'Müddətli Nömrə Kirayəsi' : 'Timed Number Rental'}
        </h1>
        <p className={`font-medium max-w-md ${d('text-slate-500', 'text-[#8B949E]')}`}>
          {language === 'tr' ? 'Günlük veya haftalık olarak numara kiralayın, kiralama süresi boyunca dilediğiniz kadar SMS alın.' : language === 'az' ? 'Günlük və ya həftəlik nömrə kirayələyin, kirayə müddətində istədiyiniz qədər SMS qəbul edin.' : 'Rent a number on daily or weekly basis, receive unlimited SMS during your rental duration.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Apps */}
        <div className={`backdrop-blur-xl border rounded-3xl p-5 flex flex-col h-[520px] transition-all duration-300 ${d('bg-white/60 border-white/40 shadow-lg', 'bg-[#161B22]/90 border-[#30363D] shadow-xl')}`}>
          <h2 className={`text-lg font-black display-font mb-4 flex items-center gap-2 ${d('text-slate-800', 'text-[#E6EDF3]')}`}>
            <span className={`p-1.5 rounded-lg ${d('bg-indigo-50 text-indigo-650', 'bg-indigo-950/40 text-indigo-450')}`}><Smartphone className="h-4 w-4" /></span>
            1. {language === 'tr' ? 'Uygulama Seçin' : language === 'az' ? 'Tətbiq Seçin' : 'Select Application'}
          </h2>
          <div className="relative mb-4 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4648d4] to-[#712ae2] rounded-xl opacity-0 group-focus-within:opacity-35 blur transition-opacity duration-300"></div>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'tr' ? 'Uygulama Ara...' : language === 'az' ? 'Tətbiq Axtar...' : 'Search Application...'}
              value={appSearch}
              onChange={(e) => setAppSearch(e.target.value)}
              className={`relative w-full pl-10 pr-4 py-3 border focus:border-indigo-500 rounded-xl text-sm outline-none transition-all ${d('bg-white border-slate-200 text-slate-850 focus:bg-white placeholder:text-slate-400', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3] focus:bg-[#0D1117] placeholder:text-[#484F58]')}`}
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredApps.map((app: any) => {
              const isSelected = selectedApp === app.name;
              return (
                <button
                  key={app.name}
                  onClick={() => { setSelectedApp(app.name); setSelectedCountry(null); }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#4648d4] to-[#712ae2] text-white border-transparent shadow-[0_4px_12px_rgba(70,72,212,0.2)]'
                      : d('bg-white/80 border-slate-100 hover:border-indigo-150 hover:bg-white text-slate-700', 'bg-[#21262D]/70 border-[#30363D] hover:border-indigo-700/40 hover:bg-[#21262D] text-[#E6EDF3]')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AppLogo name={app.name} className="h-10 w-10" />
                    <div>
                      <div className="font-extrabold text-sm capitalize">{app.displayName}</div>
                      <div className={`text-xs ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {language === 'tr' ? 'Kiralık Mevcut' : language === 'az' ? 'Kirayə Aktivdir' : 'Rental Available'}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Column: Countries */}
        <div className={`backdrop-blur-xl border rounded-3xl p-5 flex flex-col h-[520px] transition-all duration-300 ${d('bg-white/60 border-white/40 shadow-lg', 'bg-[#161B22]/90 border-[#30363D] shadow-xl')}`}>
          <h2 className={`text-lg font-black display-font mb-4 flex items-center gap-2 ${d('text-slate-800', 'text-[#E6EDF3]')}`}>
            <span className={`p-1.5 rounded-lg ${d('bg-indigo-50 text-indigo-650', 'bg-indigo-950/40 text-indigo-450')}`}><Globe className="h-4 w-4" /></span>
            2. {language === 'tr' ? 'Ülke Seçin' : language === 'az' ? 'Ölkə Seçin' : 'Select Country'}
          </h2>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1 group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4648d4] to-[#712ae2] rounded-xl opacity-0 group-focus-within:opacity-35 blur transition-opacity duration-300"></div>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={language === 'tr' ? 'Ülke Ara...' : language === 'az' ? 'Ölkə Ara...' : 'Search Country...'}
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className={`relative w-full pl-10 pr-4 py-3 border focus:border-indigo-500 rounded-xl text-sm outline-none transition-all ${d('bg-white border-slate-200 text-slate-850 focus:bg-white placeholder:text-slate-400', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3] focus:bg-[#0D1117] placeholder:text-[#484F58]')}`}
              />
            </div>
            
            <select
              value={`${countrySort}-${sortDirection}`}
              onChange={(e) => {
                const [sort, dir] = e.target.value.split('-');
                setCountrySort(sort as any);
                setSortDirection(dir as any);
              }}
              className={`border text-xs font-bold rounded-xl px-2.5 py-3 focus:outline-none focus:border-indigo-500 cursor-pointer transition-all ${d('bg-white border-slate-200 text-slate-700', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3]')}`}
            >
              <option value="stock-desc">{language === 'tr' ? 'En Çok Stok' : language === 'az' ? 'Ən Çox Stok' : 'Max Stock'}</option>
              <option value="stock-asc">{language === 'tr' ? 'En Az Stok' : language === 'az' ? 'Ən Az Stok' : 'Min Stock'}</option>
              <option value="price-asc">{language === 'tr' ? 'En Ucuz' : language === 'az' ? 'Ən Ucuz' : 'Cheapest'}</option>
              <option value="price-desc">{language === 'tr' ? 'En Pahalı' : language === 'az' ? 'Ən Bahalı' : 'Most Expensive'}</option>
            </select>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {sortedCountries.map((c: any) => {
              const isSelected = selectedCountry === c.code;
              const callingCode = countryCallingCodes[c.code.toLowerCase().replace(/[^a-z0-9]/g, '')] || '';
              
              const appDetails = selectedApp ? pricingData?.prices?.[c.code]?.[selectedApp] : null;
              const displayPrice = appDetails ? appDetails.minPrice : c.minPrice;
              const displayStock = appDetails ? appDetails.totalCount : c.totalCount;

              return (
                <button
                  key={c.code}
                  onClick={() => setSelectedCountry(c.code)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#4648d4] to-[#712ae2] text-white border-transparent shadow-[0_4px_12px_rgba(70,72,212,0.2)]'
                      : d('bg-white/80 border-slate-100 hover:border-indigo-150 hover:bg-white text-slate-700', 'bg-[#21262D]/70 border-[#30363D] hover:border-indigo-700/40 hover:bg-[#21262D] text-[#E6EDF3]')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full overflow-hidden relative shadow-sm border flex items-center justify-center ${d('border-slate-200/50 bg-slate-50', 'border-[#30363D] bg-[#161B22]')}`}>
                      <span className={`fi fi-${getCountryFlagCode(c.flagCode || c.name)} !w-full !h-full rounded-full absolute inset-0 !bg-cover !bg-center`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-sm">{c.name} {callingCode ? `(${callingCode})` : ''}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] ${isSelected ? 'text-indigo-100' : 'text-slate-400'} font-medium`}>{displayStock || 0} {language === 'tr' ? 'stok' : language === 'az' ? 'stok' : 'stock'}</span>
                        {renderSignalBars(displayStock || 0)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>{language === 'tr' ? 'Günlük' : language === 'az' ? 'Günlük' : 'Daily'}</span>
                    <div className="font-black text-sm">{(displayPrice || 0).toFixed(2)} ₺</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Operators & Buy */}
        <div className={`backdrop-blur-xl border rounded-3xl p-5 flex flex-col h-[520px] transition-all duration-300 ${d('bg-white/60 border-white/40 shadow-lg', 'bg-[#161B22]/90 border-[#30363D] shadow-xl')}`}>
          <h2 className={`text-lg font-black display-font mb-4 flex items-center gap-2 ${d('text-slate-800', 'text-[#E6EDF3]')}`}>
            <span className={`p-1.5 rounded-lg ${d('bg-indigo-50 text-indigo-650', 'bg-indigo-950/40 text-indigo-450')}`}><Clock className="h-4 w-4" /></span>
            3. {language === 'tr' ? 'Süre & Satın Alma' : language === 'az' ? 'Müddət & Satın Alma' : 'Duration & Purchase'}
          </h2>

          {!selectedCountry ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-4 gap-2">
              <AlertCircle className="h-10 w-10 text-slate-300" />
              <span className="font-bold text-sm">{language === 'tr' ? 'Lütfen önce bir uygulama ve ülke seçiniz.' : language === 'az' ? 'Zəhmət olmasa əvvəlcə tətbiq və ölkə seçin.' : 'Please select an application and country first.'}</span>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between min-h-0">
              
              {/* Duration Selector */}
              <div className="space-y-3">
                <label className={`block text-xs font-bold ${d('text-slate-500', 'text-[#8B949E]')}`}>{language === 'tr' ? 'Kiralama Süresi' : language === 'az' ? 'Kirayə Müddəti' : 'Rental Duration'}</label>
                <div className="grid grid-cols-2 gap-2">
                  {localizedRentPeriods.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setSelectedPeriod(p.value)}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition-all ${
                        selectedPeriod === p.value
                          ? 'bg-indigo-500/10 border-indigo-400 text-indigo-750 shadow-inner'
                          : d('bg-white border-slate-200 text-slate-600 hover:border-indigo-200', 'bg-[#21262D]/60 border-[#30363D] text-[#8B949E] hover:border-indigo-850')
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing Cards for Available Operators */}
              <div className="flex-1 overflow-y-auto my-4 space-y-2 pr-1 custom-scrollbar">
                <label className={`block text-xs font-bold mb-1.5 ${d('text-slate-500', 'text-[#8B949E]')}`}>{language === 'tr' ? 'Operatör Seçin' : language === 'az' ? 'Operator Seçin' : 'Select Operator'}</label>
                {operatorsData.map((op) => {
                  const totalPrice = op.priceTry * (selectedPeriod / 24);
                  return (
                    <div key={op.code} className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between transition-all ${d('bg-white border-slate-100', 'bg-[#161B22] border-[#30363D]')}`}>
                      <div className="text-left">
                        <span className={`font-black text-sm uppercase ${d('text-slate-800', 'text-[#E6EDF3]')}`}>{op.code === 'any' ? (language === 'tr' ? 'Rastgele' : language === 'az' ? 'Təsadüfi' : 'Random') : op.code}</span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-0.5">
                          <span>{language === 'tr' ? 'Günlük' : language === 'az' ? 'Günlük' : 'Daily'}: {op.priceTry.toFixed(2)} ₺</span>
                          {op.code !== 'any' && (
                            <>
                              <span>•</span>
                              <span>{op.count} {language === 'tr' ? 'stok' : language === 'az' ? 'stok' : 'stock'}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 font-bold block">{language === 'tr' ? 'TOPLAM' : language === 'az' ? 'TOPLAM' : 'TOTAL'}</span>
                          <span className={`text-base font-black ${d('text-indigo-650', 'text-indigo-400')}`}>{totalPrice.toFixed(2)} ₺</span>
                        </div>
                        <button
                          onClick={() => handleRent(op.code)}
                          disabled={isBuying}
                          className="bg-gradient-to-r from-[#4648d4] to-[#712ae2] hover:from-[#3b3db8] hover:to-[#5e22be] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 hover:scale-[1.03] disabled:opacity-50"
                        >
                          {isBuying ? <Loader2 className="h-3 w-3 animate-spin" /> : (language === 'tr' ? 'Kirala' : language === 'az' ? 'Kirayələ' : 'Rent')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Active Rental Orders Section */}
      <div className={`backdrop-blur-xl border rounded-3xl p-6 transition-all duration-300 ${d('bg-white/60 border-white/40 shadow-lg', 'bg-[#161B22]/90 border-[#30363D]')}`}>
        <div className={`flex items-center justify-between border-b pb-4 ${d('border-slate-100', 'border-[#21262D]')}`}>
          <div className="text-left">
            <h2 className={`text-2xl font-black display-font ${d('text-slate-800', 'text-[#E6EDF3]')}`}>{language === 'tr' ? 'Aktif Kiralamalarınız' : language === 'az' ? 'Aktiv Kirayələriniz' : 'Your Active Rentals'}</h2>
            <p className={`text-sm ${d('text-slate-500', 'text-[#8B949E]')}`}>{language === 'tr' ? 'Devam eden kiralamalarınız ve gelen SMS kodları.' : language === 'az' ? 'Davam edən kirayələriniz və gələn SMS kodları.' : 'Your ongoing rentals and received SMS codes.'}</p>
          </div>
          <button 
            onClick={fetchRentOrders}
            disabled={isFetchingOrders}
            className={`px-4 py-2.5 border rounded-xl transition-all flex items-center gap-2 text-xs font-bold shadow-sm ${d('bg-white border-slate-200 text-slate-700 hover:border-indigo-200 hover:text-indigo-600', 'bg-[#21262D] border-[#30363D] text-[#E6EDF3] hover:border-indigo-800')}`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetchingOrders ? 'animate-spin' : ''}`} /> {language === 'tr' ? 'Güncelle' : language === 'az' ? 'Yenilə' : 'Update'}
          </button>
        </div>

        {isFetchingOrders ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : rentOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium">
             {language === 'tr' ? 'Aktif kiralık numaranız bulunmuyor. Yukarıdaki panelden yeni kiralama yapabilirsiniz.' : language === 'az' ? 'Aktiv kirayə nömrəniz yoxdur. Yuxarıdakı paneldən yeni kirayə edə bilərsiniz.' : 'You do not have any active rented numbers. You can make a new rental from the panel above.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {rentOrders.map((order) => {
                let smsMessages = [];
                try {
                  if (order.smsCode) {
                    smsMessages = JSON.parse(order.smsCode);
                  }
                } catch(e) {
                  if (order.smsCode) {
                    smsMessages = [{ text: order.smsCode, sender: 'SMS', date: order.updatedAt }];
                  }
                }

                return (
                  <div key={order.id} className={`rounded-3xl border shadow-sm p-6 space-y-4 text-left ${d('bg-white/80 border-slate-100', 'bg-[#161B22] border-[#30363D]')}`}>
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                           <div className={`h-10 w-10 rounded-xl border flex items-center justify-center font-black uppercase text-sm ${d('bg-indigo-50 border-indigo-100 text-[#4648d4]', 'bg-indigo-950/20 border-indigo-900/30 text-indigo-400')}`}>
                              {order.serviceCode.substring(0,2)}
                           </div>
                           <div className="text-left">
                              <span className={`font-black text-base ${d('text-slate-800', 'text-[#E6EDF3]')}`}>{order.serviceCode.toUpperCase()}</span>
                              <span className="text-xs text-slate-400 font-semibold block uppercase">{order.countryCode} ({order.operatorCode})</span>
                           </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 shadow-sm ${d('bg-indigo-50 border-indigo-100 text-indigo-700', 'bg-[#21262D] border-[#30363D] text-indigo-400')}`}>
                           <Clock className="h-3.5 w-3.5" /> {getRemainingTime(order.expiresAt)}
                        </div>
                     </div>

                     <div className={`border rounded-2xl p-4 flex items-center justify-between ${d('bg-slate-50 border-slate-100', 'bg-[#0D1117] border-[#21262D]')}`}>
                        <div className="text-left">
                           <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">{language === 'tr' ? 'Telefon Numarası' : language === 'az' ? 'Telefon Nömrəsi' : 'Phone Number'}</span>
                           <span className={`font-black text-lg ${d('text-slate-800', 'text-[#E6EDF3]')}`}>{order.phoneNumber}</span>
                        </div>
                        <button 
                           onClick={() => { navigator.clipboard.writeText(order.phoneNumber); showToast(language === 'tr' ? 'Numara kopyalandı.' : language === 'az' ? 'Nömrə kopyalandı.' : 'Number copied.', 'success'); }}
                           className={`p-2 rounded-xl transition-colors cursor-pointer ${d('hover:bg-slate-200 text-slate-400 hover:text-slate-600', 'hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3]')}`}
                        >
                           <Clipboard className="h-4.5 w-4.5" />
                        </button>
                     </div>

                     {/* Received SMS list */}
                     <div className="space-y-2">
                        <span className={`text-xs font-bold block ${d('text-slate-650', 'text-slate-350')}`}>{language === 'tr' ? 'Gelen SMS Kutusu' : language === 'az' ? 'Gələn SMS Qutusu' : 'Received SMS Inbox'}</span>
                        <div className={`border rounded-2xl divide-y max-h-48 overflow-y-auto ${d('bg-slate-50 border-slate-100 divide-slate-100', 'bg-[#0D1117] border-[#21262D] divide-[#21262D]')}`}>
                           {smsMessages.length === 0 ? (
                              <div className="p-4 text-center text-xs text-slate-400 font-bold animate-pulse">
                                 {language === 'tr' ? 'SMS bekleniyor... (Anlık güncellenir)' : language === 'az' ? 'SMS gözlənilir... (Anlıq yenilənir)' : 'Waiting for SMS... (Updates instantly)'}
                              </div>
                           ) : (
                              smsMessages.map((msg: any, idx: number) => (
                                 <div key={idx} className="p-3 flex items-start justify-between gap-3 text-left">
                                    <div className="space-y-1">
                                       <span className={`text-xs font-black block uppercase ${d('text-slate-700', 'text-slate-300')}`}>{msg.sender}</span>
                                       <p className={`text-xs font-medium leading-relaxed ${d('text-slate-500', 'text-[#8B949E]')}`}>{msg.text}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                       <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider mb-1 ${d('bg-indigo-50 border border-indigo-150 text-indigo-700', 'bg-indigo-950/40 border border-indigo-900/30 text-indigo-400')}`}>{msg.code}</span>
                                       <span className="block text-[8px] text-slate-400 font-bold">{new Date(msg.date).toLocaleTimeString(language === 'tr' ? 'tr-TR' : language === 'az' ? 'az-AZ' : 'en-US')}</span>
                                    </div>
                                 </div>
                              ))
                           )}
                        </div>
                     </div>
                  </div>
                );
             })}
          </div>
        )}
      </div>
    </div>
  );
}
