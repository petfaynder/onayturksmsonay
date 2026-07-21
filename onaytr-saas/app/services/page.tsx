"use client";

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Search, Sparkles, Globe, Loader2, ArrowRight, Smartphone } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { getCountryFlagCode } from '@/lib/utils/icons';

// Mapping country provider codes to human-readable names for languages when translation keys are missing
const countryNamesMap: Record<string, Record<string, string>> = {
  tr: {
    usa: "Amerika Birleşik Devletleri", canada: "Kanada", russia: "Rusya", kazakhstan: "Kazakistan", egypt: "Mısır",
    southafrica: "Güney Afrika", greece: "Yunanistan", netherlands: "Hollanda", belgium: "Belçika", france: "Fransa",
    spain: "İspanya", hungary: "Macaristan", italy: "İtalya", romania: "Romanya", switzerland: "İsviçre",
    austria: "Avusturya", england: "İngiltere", unitedkingdom: "Birleşik Krallık", denmark: "Danimarka",
    sweden: "İsveç", norway: "Norveç", poland: "Polonya", germany: "Almanya", peru: "Peru", mexico: "Meksika",
    cuba: "Küba", argentina: "Arjantin", brazil: "Brezilya", chile: "Şili", colombia: "Kolumbiya",
    venezuela: "Venezuela", malaysia: "Malezya", australia: "Avustralya", indonesia: "Endonezya",
    philippines: "Filipinler", newzealand: "Yeni Zelanda", singapore: "Singapur", thailand: "Tayland",
    japan: "Japonya", vietnam: "Vietnam", china: "Çin", turkey: "Türkiye", india: "Hindistan",
    pakistan: "Pakistan", afghanistan: "Afganistan", srilanka: "Sri Lanka", myanmar: "Myanmar",
    iran: "İran", morocco: "Fas", algeria: "Cezayir", tunisia: "Tunus", libya: "Libya",
    azerbaijan: "Azerbaycan", georgia: "Gürcistan", kyrgyzstan: "Kırgızistan", uzbekistan: "Özbekistan"
  },
  en: {
    usa: "United States", canada: "Canada", russia: "Russia", kazakhstan: "Kazakhstan", egypt: "Egypt",
    southafrica: "South Africa", greece: "Greece", netherlands: "Netherlands", belgium: "Belgium", france: "France",
    spain: "Spain", hungary: "Hungary", italy: "Italy", romania: "Romania", switzerland: "Switzerland",
    austria: "Austria", england: "England", unitedkingdom: "United Kingdom", denmark: "Denmark",
    sweden: "Sweden", norway: "Norway", poland: "Poland", germany: "Germany", peru: "Peru", mexico: "Mexico",
    cuba: "Cuba", argentina: "Argentina", brazil: "Brazil", chile: "Chile", colombia: "Colombia",
    venezuela: "Venezuela", malaysia: "Malaysia", australia: "Australia", indonesia: "Indonesia",
    philippines: "Philippines", newzealand: "New Zealand", singapore: "Singapore", thailand: "Thailand",
    japan: "Japan", vietnam: "Vietnam", china: "China", turkey: "Turkey", india: "India",
    pakistan: "Pakistan", afghanistan: "Afghanistan", srilanka: "Sri Lanka", myanmar: "Myanmar",
    iran: "Iran", morocco: "Morocco", algeria: "Algeria", tunisia: "Tunisia", libya: "Libya",
    azerbaijan: "Azerbaijan", georgia: "Georgia", kyrgyzstan: "Kyrgyzstan", uzbekistan: "Uzbekistan"
  },
  az: {
    usa: "Amerika Birləşmiş Ştatları", canada: "Kanada", russia: "Rusiya", kazakhstan: "Qazaxıstan", egypt: "Misir",
    southafrica: "Cənubi Afrika", greece: "Yunanıstan", netherlands: "Niderland", belgium: "Belçika", france: "Fransa",
    spain: "İspaniya", hungary: "Macarıstan", italy: "İtaliya", romania: "Rumıniya", switzerland: "İsveçrə",
    austria: "Avstriya", england: "İngiltərə", unitedkingdom: "Birləşmiş Krallıq", denmark: "Danimarka",
    sweden: "İsveç", norway: "Norveç", poland: "Polşa", germany: "Almaniya", peru: "Peru", mexico: "Meksika",
    cuba: "Kuba", argentina: "Argentina", brazil: "Braziliya", chile: "Çili", colombia: "Kolumbiya",
    venezuela: "Venesuela", malaysia: "Malayziya", australia: "Avstraliya", indonesia: "İndoneziya",
    philippines: "Filipinlər", newzealand: "Yeni Zelandiya", singapore: "Sinqapur", thailand: "Tayland",
    japan: "Yaponiya", vietnam: "Vyetnam", china: "Çin", turkey: "Türkiyə", india: "Hindistan",
    pakistan: "Pakistan", afghanistan: "Əfqanıstan", srilanka: "Şri Lanka", myanmar: "Myanmar",
    iran: "İran", morocco: "Mərakeş", algeria: "Əlcəzair", tunisia: "Tunis", libya: "Liviya",
    azerbaijan: "Azərbaycan", georgia: "Gürcüstan", kyrgyzstan: "Qırğızıstan", uzbekistan: "Özbəkistan"
  }
};

export default function ServicesPage() {
  const { data: session } = useSession();
  const { t, language } = useLanguage();
  const [pricingData, setPricingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<string>('all');

  useEffect(() => {
    async function loadPrices() {
      try {
        const res = await fetch('/api/pricing', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setPricingData(data);
        }
      } catch (err) {
        console.error("Pricing fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPrices();
  }, []);

  const getCountryName = (code: string) => {
    const list = countryNamesMap[language] || countryNamesMap['tr'];
    return list[code] || code.charAt(0).toUpperCase() + code.slice(1);
  };

  const getServiceName = (code: string) => {
    const serviceDisplayNames: Record<string, string> = {
      whatsapp: "WhatsApp / Business",
      telegram: "Telegram Messenger",
      google: "Google / Gmail / YouTube",
      instagram: "Instagram & Threads",
      facebook: "Facebook / Meta",
      twitter: "Twitter / X",
      discord: "Discord App",
      netflix: "Netflix Account",
      microsoft: "Microsoft / Outlook",
      apple: "Apple / iCloud",
      openai: "OpenAI / ChatGPT",
      tiktok: "TikTok Messenger",
      steam: "Steam Gaming",
      tinder: "Tinder Dating",
      amazon: "Amazon Shop",
      line: "LINE App",
      wechat: "WeChat App",
      viber: "Viber App",
      snapchat: "Snapchat App",
    };
    return serviceDisplayNames[code.toLowerCase()] || code.charAt(0).toUpperCase() + code.slice(1);
  };

  // 1. Flatten all combination rows only when pricingData changes
  const allRows = useMemo(() => {
    if (!pricingData || !pricingData.detailedPricing) return [];
    
    const rows: { country: string, service: string, price: number, stock: number }[] = [];
    const detailed = pricingData.detailedPricing;

    Object.entries(detailed).forEach(([countryCode, services]: [string, any]) => {
      Object.entries(services).forEach(([serviceCode, data]: [string, any]) => {
        rows.push({
          country: countryCode,
          service: serviceCode,
          price: data.minPrice,
          stock: data.totalCount
        });
      });
    });
    return rows;
  }, [pricingData]);

  // 2. Filter, sort and slice the list to prevent browser thread freeze (capping at 50 cheapest matches)
  const activeRows = useMemo(() => {
    let rows = allRows;

    if (selectedCountry !== 'all') {
      rows = rows.filter(r => r.country === selectedCountry);
    }
    if (selectedApp !== 'all') {
      rows = rows.filter(r => r.service === selectedApp);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(r => 
        getCountryName(r.country).toLowerCase().includes(q) ||
        getServiceName(r.service).toLowerCase().includes(q)
      );
    }

    return rows.sort((a, b) => a.price - b.price).slice(0, 55);
  }, [allRows, selectedCountry, selectedApp, searchQuery, language]);

  const countries = pricingData?.countries || [];
  const apps = pricingData?.apps || [];

  return (
    <div className="min-h-screen bg-[#F8F9FF] dark:bg-[#0D1117] pt-28 pb-16 text-left relative overflow-hidden">
      
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4648d4]/5 dark:bg-[#4648d4]/2 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#712ae2]/5 dark:bg-[#712ae2]/2 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute inset-0 micro-grid opacity-75 -z-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="h-14 w-14 bg-gradient-to-br from-[#4648d4] to-[#712ae2] rounded-2xl flex items-center justify-center shadow-lg shadow-[#4648d4]/10 mb-4 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white display-font mb-4">
            {language === 'tr' ? 'Servisler ve Fiyat Listesi' : language === 'az' ? 'Servislər və Qiymət Siyahısı' : 'Services & Price List'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl text-base">
            {language === 'tr' 
              ? 'OnayTR üzerinden sunulan tüm aktif uygulamaları, ülke stoklarını ve başlangıç fiyatlarını anlık olarak inceleyebilirsiniz.' 
              : language === 'az'
              ? 'OnayTR üzərindən təqdim olunan bütün aktiv tətbiqləri, ölkə stoklarını və başlanğıc qiymətlərini anlıq olaraq nəzərdən keçirə bilərsiniz.'
              : 'View all active apps, country stock availability, and starting prices provided by OnayTR in real time.'}
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-[#4648d4] animate-spin mb-4" />
            <span className="text-sm font-bold text-slate-400">{language === 'tr' ? 'Fiyat listesi yükleniyor...' : language === 'az' ? 'Qiymət siyahısı yüklənir...' : 'Loading price catalog...'}</span>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-8">
            
            {/* Filter Panel (Left Column) */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Search Widget */}
              <div className="glass-premium p-5 rounded-2xl shadow-sm space-y-3">
                <h3 className="text-sm font-black text-slate-850 dark:text-slate-200 display-font uppercase tracking-wider flex items-center gap-2">
                  <Search className="h-4 w-4 text-[#4648d4]" /> {language === 'tr' ? 'Arama' : language === 'az' ? 'Axtarış' : 'Search'}
                </h3>
                <input
                  type="text"
                  placeholder={t('lp_pricing_search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/10 transition-all text-slate-800 dark:text-white"
                />
              </div>

              {/* Country Filter Widget */}
              <div className="glass-premium p-5 rounded-2xl shadow-sm space-y-3">
                <h3 className="text-sm font-black text-slate-850 dark:text-slate-200 display-font uppercase tracking-wider flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#4648d4]" /> {language === 'tr' ? 'Ülke Seçimi' : language === 'az' ? 'Ölkə Seçimi' : 'Country'}
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-2 no-scrollbar">
                  <button
                    onClick={() => setSelectedCountry('all')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${selectedCountry === 'all' ? 'bg-[#4648d4]/10 text-[#4648d4]' : 'hover:bg-slate-50 dark:hover:bg-slate-855 text-slate-600 dark:text-slate-400'}`}
                  >
                    <span>{language === 'tr' ? 'Tüm Ülkeler' : language === 'az' ? 'Bütün Ölkələr' : 'All Countries'}</span>
                  </button>
                  {countries.map((country: any) => (
                    <button
                      key={country.code}
                      onClick={() => setSelectedCountry(country.code)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${selectedCountry === country.code ? 'bg-[#4648d4]/10 text-[#4648d4]' : 'hover:bg-slate-50 dark:hover:bg-slate-855 text-slate-600 dark:text-slate-400'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`fi fi-${getCountryFlagCode(country.code)} rounded-sm shrink-0`} />
                        <span className="truncate">{getCountryName(country.code)}</span>
                      </div>
                      <span className="text-[10px] opacity-70">({country.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Filter Widget */}
              <div className="glass-premium p-5 rounded-2xl shadow-sm space-y-3">
                <h3 className="text-sm font-black text-slate-850 dark:text-slate-200 display-font uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-[#4648d4]" /> {language === 'tr' ? 'Uygulama Seçimi' : language === 'az' ? 'Tətbiq Seçimi' : 'Application'}
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-2 no-scrollbar">
                  <button
                    onClick={() => setSelectedApp('all')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${selectedApp === 'all' ? 'bg-[#4648d4]/10 text-[#4648d4]' : 'hover:bg-slate-50 dark:hover:bg-slate-855 text-slate-600 dark:text-slate-400'}`}
                  >
                    <span>{language === 'tr' ? 'Tüm Uygulamalar' : language === 'az' ? 'Bütün Tətbiqlər' : 'All Apps'}</span>
                  </button>
                  {apps.map((app: any) => (
                    <button
                      key={app.name}
                      onClick={() => setSelectedApp(app.name)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${selectedApp === app.name ? 'bg-[#4648d4]/10 text-[#4648d4]' : 'hover:bg-slate-50 dark:hover:bg-slate-855 text-slate-600 dark:text-slate-400'}`}
                    >
                      <span>{getServiceName(app.name)}</span>
                      <span className="text-[10px] opacity-70">({app.count})</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* List Results (Right Column) */}
            <div className="lg:col-span-3">
              <div className="glass-premium rounded-3xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-slate-800/10 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-widest">
                        <th className="p-5">{language === 'tr' ? 'Uygulama' : language === 'az' ? 'Tətbiq' : 'Application'}</th>
                        <th className="p-5">{language === 'tr' ? 'Ülke' : language === 'az' ? 'Ölkə' : 'Country'}</th>
                        <th className="p-5">{language === 'tr' ? 'Stok Durumu' : language === 'az' ? 'Stok Durumu' : 'Stock'}</th>
                        <th className="p-5">{language === 'tr' ? 'Başlangıç Fiyatı' : language === 'az' ? 'Başlanğıc Qiyməti' : 'Starting Price'}</th>
                        <th className="p-5 text-center">{language === 'tr' ? 'İşlem' : language === 'az' ? 'Əməliyyat' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {activeRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors">
                          
                          {/* Application Column */}
                          <td className="p-5 text-sm font-bold text-slate-800 dark:text-white">
                            {getServiceName(row.service)}
                          </td>
                          
                          {/* Country Column */}
                          <td className="p-5 text-sm font-semibold text-slate-600 dark:text-slate-350 flex items-center gap-2">
                            <span className={`fi fi-${getCountryFlagCode(row.country)} rounded-sm shrink-0`} />
                            <span>{getCountryName(row.country)}</span>
                          </td>
                          
                          {/* Stock Status Column */}
                          <td className="p-5 text-xs font-bold">
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${row.stock > 100 ? 'bg-emerald-500 shadow-sm animate-pulse' : row.stock > 10 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                              <span className="text-slate-700 dark:text-slate-300">{row.stock} {language === 'tr' ? 'adet' : language === 'az' ? 'ədəd' : 'pcs'}</span>
                            </div>
                          </td>
                          
                          {/* Price Column */}
                          <td className="p-5 text-sm font-black text-[#4648d4]">
                            {row.price.toFixed(2)} ₺
                          </td>
                          
                          {/* Action Button */}
                          <td className="p-5 text-center">
                            <Link
                              href={session ? "/dashboard" : "/auth/login"}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#4648d4] to-[#712ae2] hover:from-[#3b3db8] hover:to-[#5e22be] text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_12px_rgba(70,72,212,0.15)] hover:shadow-[0_4px_15px_rgba(70,72,212,0.25)] hover:-translate-y-0.5"
                            >
                              {language === 'tr' ? 'Numara Al' : language === 'az' ? 'Nömrə Al' : 'Get Number'}
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </td>
                          
                        </tr>
                      ))}

                      {activeRows.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-slate-400 font-bold text-sm">
                            {language === 'tr' ? 'Kriterlere uygun aktif servis bulunamadı.' : language === 'az' ? 'Kriteriyaya uyğun aktiv servis tapılmadı.' : 'No active services matching criteria found.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
