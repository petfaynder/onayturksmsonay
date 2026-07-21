"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  Smartphone, 
  Clock, 
  ListOrdered, 
  CreditCard, 
  User as UserIcon, 
  MessageSquare, 
  Code, 
  LogOut, 
  Sparkles, 
  Wallet,
  RefreshCw,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  Check,
  Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { useToast } from '@/components/ToastProvider';

export default function DashboardHeader() {
  const { data: session, update: updateSession } = useSession();
  const user = session?.user as any;
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, toggleDark } = useTheme();
  const { language, setLanguage, t, supportedLangs } = useLanguage() as any;
  const { showToast } = useToast();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const [numMenuOpen, setNumMenuOpen] = useState(false);

  // Announcements state
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [annOpen, setAnnOpen] = useState(false);
  const [hasNewAnn, setHasNewAnn] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    
    const fetchAnnouncements = async () => {
      try {
        const r = await fetch('/api/announcements');
        if (r.ok) {
          const d = await r.json();
          const list = d.announcements || [];
          setAnnouncements(list);
          
          if (list.length > 0) {
            const latestId = list[0].id;
            const lastSeenId = localStorage.getItem('last_seen_announcement_id');
            if (lastSeenId !== latestId) {
              setHasNewAnn(true);
            }
          }
        }
      } catch (err) {
        console.error('Duyurular yüklenemedi:', err);
      }
    };
    
    fetchAnnouncements();
  }, [session]);

  const handleOpenAnnouncements = () => {
    setAnnOpen(!annOpen);
    if (!annOpen && announcements.length > 0) {
      localStorage.setItem('last_seen_announcement_id', announcements[0].id);
      setHasNewAnn(false);
    }
  };

  // Sync balance helper
  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        if (data.balance !== undefined) {
          await updateSession({ balance: data.balance });
          showToast(t('balance_refreshed') || 'Bakiye güncellendi', 'success');
        }
      }
    } catch (e) {
      // silent
    } finally {
      setIsRefreshing(false);
    }
  };

  const navLinks = [
    { href: '/dashboard', label: t('nav_tek_kullanimlik') || 'SMS Onay', icon: Smartphone },
    { href: '/rent', label: t('nav_kiralik') || 'Numara Kiralama', icon: Clock },
    { href: '/numbers', label: t('nav_numaralarim') || 'Sipariş Geçmişi', icon: ListOrdered },
    { href: '/balance', label: t('nav_bakiye') || 'Bakiye Yükle', icon: CreditCard },
    { href: '/profile', label: t('nav_profilim') || 'Profil Ayarları', icon: UserIcon },
    { href: '/support', label: t('nav_yardim') || 'Destek Talepleri', icon: MessageSquare },
    { href: '/developer', label: t('lp_nav_developer') || 'API & Geliştirici', icon: Code },
  ];

  const getTierColor = (tier: string) => {
    switch (tier?.toUpperCase()) {
      case 'GOLD':
        return 'from-amber-400 to-yellow-500 text-amber-950 shadow-[0_0_12px_rgba(245,158,11,0.2)]';
      case 'SILVER':
        return 'from-slate-300 to-slate-400 text-slate-900 shadow-[0_0_12px_rgba(148,163,184,0.2)]';
      default:
        return 'from-amber-700 to-amber-800 text-amber-50 shadow-[0_0_12px_rgba(180,83,9,0.1)]';
    }
  };

  const d = (light: string, dark: string) => isDark ? dark : light;

  return (
    <>
      {/* DESKTOP TWO-TIER HEADER */}
      <header className="hidden lg:block w-full sticky top-0 z-45 transition-colors shadow-sm">
        
        {/* TIER 1: Upper top bar - Unified Navy Brand */}
        <div className="w-full h-14 flex items-center justify-between px-6 transition-colors border-b bg-[#0B1C30] border-white/5 text-white">
          <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between">
            
            {/* Left: Logo & Flags */}
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center group relative shrink-0">
                <span className="text-xl lg:text-2xl font-black tracking-tight display-font text-white">
                  Onay<span className="text-amber-300">TR</span>
                </span>
                <Sparkles className="h-4.5 w-4.5 ml-1 mb-1 text-amber-300 animate-pulse" />
              </Link>

              {/* Language Flags Selector (Premium Dropdown) */}
              <div 
                className="relative z-50"
                onMouseEnter={() => setLangOpen(true)}
                onMouseLeave={() => setLangOpen(false)}
              >
                <button 
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-white/5 border-white/10 hover:bg-white/10 text-white transition-all text-xs font-black"
                >
                  <span className={`fi fi-${language === 'tr' ? 'tr' : language === 'en' ? 'gb' : 'az'} h-3.5 w-3.5 rounded-full overflow-hidden shrink-0 block bg-cover`} />
                  <span className="uppercase text-[11px] font-extrabold tracking-wider">{language === 'tr' ? 'TR' : language === 'en' ? 'EN' : 'AZ'}</span>
                  <ChevronDown className={`h-3.5 w-3.5 opacity-60 transition-transform duration-300 ${langOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {langOpen && (
                  <div className="absolute left-0 top-[calc(100%-4px)] pt-3 z-50">
                    <div className="w-36 rounded-2xl border bg-[#0F1C2E] border-white/10 shadow-2xl p-1.5 animate-fade-in">
                      {[
                        { code: 'tr', flag: 'tr', label: 'Türkçe' },
                        { code: 'en', flag: 'gb', label: 'English' },
                        { code: 'az', flag: 'az', label: 'Azərbaycanca' }
                      ].filter(item => supportedLangs[item.code as 'tr' | 'en' | 'az'] !== false).map((item) => (
                        <button
                          key={item.code}
                          onClick={() => {
                            setLanguage(item.code as any);
                            setLangOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold transition-all ${
                            language === item.code 
                              ? 'bg-amber-400 text-[#0F1C2E] shadow-sm' 
                              : 'text-slate-200 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`fi fi-${item.flag} h-3.5 w-3.5 rounded-full overflow-hidden shrink-0 block bg-cover`} />
                            <span>{item.label}</span>
                          </div>
                          {language === item.code && <Check className="h-3.5 w-3.5 text-[#0F1C2E]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Balance & User profile & theme */}
            <div className="flex items-center gap-3">
              
              {/* Balance Widget */}
              {user && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all bg-white/5 border border-white/10 text-indigo-300">
                  <Wallet className="h-4 w-4 shrink-0 text-amber-300" />
                  <span className="font-extrabold tracking-tight font-sans text-white text-[13px]">
                    {parseFloat(user.balance || 0).toFixed(2)} ₺
                  </span>
                  <button 
                    onClick={handleRefreshBalance}
                    disabled={isRefreshing}
                    className={`p-0.5 rounded-full hover:bg-white/10 transition-colors ${
                      isRefreshing ? 'animate-spin text-slate-300' : ''
                    }`}
                    title="Yenile"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-slate-350" />
                  </button>
                </div>
              )}

              {/* Profile Badge / Tier */}
              {user && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border bg-white/5 border-white/10 text-white" title={user.email}>
                  <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black text-[10px] shadow-sm">
                    {user.email?.slice(0, 2).toUpperCase()}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest bg-gradient-to-r uppercase ${getTierColor(user.tierLevel || 'BRONZE')}`}>
                    {user.tierLevel || 'BRONZE'}
                  </span>
                </div>
              )}

              {/* Announcements Dropdown */}
              <div className="relative">
                <button
                  onClick={handleOpenAnnouncements}
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-all relative cursor-pointer ${
                    annOpen ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-slate-350 hover:text-white'
                  }`}
                  title={t('nav_duyurular') || 'Duyurular'}
                >
                  <Bell className="h-4.5 w-4.5" />
                  {hasNewAnn && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#0F1C2E] animate-pulse" />
                  )}
                </button>

                {annOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAnnOpen(false)} />
                    <div className={`absolute right-0 mt-3 w-80 rounded-2xl border p-4 shadow-xl z-50 animate-fade-in ${
                      isDark ? 'bg-[#161B22] border-slate-800 text-slate-200 shadow-slate-950/50' : 'bg-white border-slate-200 text-slate-700 shadow-slate-200/50'
                    }`}>
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100/10 dark:border-slate-800/80">
                        <span className="font-extrabold text-sm flex items-center gap-1.5 text-[#4648d4] dark:text-indigo-400">
                          <Bell className="h-4 w-4" /> {t('nav_duyurular') || 'Duyurular'}
                        </span>
                        {announcements.length > 0 && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            {announcements.length}
                          </span>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                        {announcements.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-400">
                            {t('nav_duyuru_yok') || 'Yeni bir duyuru bulunmuyor.'}
                          </div>
                        ) : (
                          announcements.map((ann) => (
                            <div 
                              key={ann.id} 
                              className={`p-2.5 rounded-xl border transition-all text-left ${
                                isDark 
                                  ? 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900' 
                                  : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/50'
                              }`}
                            >
                              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 mb-1 leading-snug">{ann.title}</h4>
                              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">{ann.content}</p>
                              <span className="text-[9px] font-bold text-slate-400 mt-2 block text-right">
                                {new Date(ann.createdAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleDark}
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                {isDark ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-slate-350" />}
              </button>
            </div>
          </div>
        </div>

        {/* TIER 2: Bottom links bar - Left Aligned & Enlarged */}
        <div className={`w-full h-13 flex items-center px-6 transition-colors border-b ${
          isDark 
            ? 'bg-[#0B121F] border-slate-800/80' 
            : 'bg-white border-slate-200/80'
        }`}>
          <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between relative">
            
            {/* Left-Aligned Navigation */}
            <nav className="flex items-center gap-2">
              
              {/* Numara Al Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setNumMenuOpen(true)}
                onMouseLeave={() => setNumMenuOpen(false)}
              >
                <button 
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm lg:text-[14.5px] xl:text-[15px] font-extrabold transition-all ${
                    (pathname === '/dashboard' || pathname === '/rent')
                      ? 'bg-[#4648d4]/10 text-[#4648d4] dark:bg-[#4648d4]/20 dark:text-indigo-300'
                      : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-900/50' : 'text-slate-600 hover:text-[#4648d4] hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="h-5 w-5 shrink-0" />
                  <span>{t('nav_numara_al') || 'Numara Al'}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${numMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {numMenuOpen && (
                  <div className={`absolute left-0 mt-1 w-52 rounded-xl border p-1.5 shadow-lg z-50 animate-fade-in-up ${
                    isDark ? 'bg-[#161B22] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <Link
                      href="/dashboard"
                      onClick={() => setNumMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-bold transition-colors ${
                        isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                      }`}
                    >
                      <Smartphone className="h-4 w-4 text-[#4648d4] shrink-0" />
                      <div className="flex flex-col">
                        <span>{t('nav_tek_kullanimlik') || 'Tek Kullanımlık Numara'}</span>
                        <span className="text-[9px] font-normal text-slate-400">SMS Onay / Instant SMS</span>
                      </div>
                    </Link>
                    <Link
                      href="/rent"
                      onClick={() => setNumMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-bold transition-colors ${
                        isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                      }`}
                    >
                      <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                      <div className="flex flex-col">
                        <span>{t('nav_kiralik') || 'Kiralık Numara'}</span>
                        <span className="text-[9px] font-normal text-slate-400">Süreli Kiralama / Number Rent</span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Rest of the links */}
              {navLinks.slice(2).map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm lg:text-[14.5px] xl:text-[15px] font-extrabold transition-all ${
                      isActive
                        ? 'bg-[#4648d4]/10 text-[#4648d4] dark:bg-[#4648d4]/20 dark:text-indigo-300'
                        : isDark
                          ? 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                          : 'text-slate-650 hover:text-[#4648d4] hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right-Aligned Log Out */}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-rose-500/10 text-rose-500 transition-colors text-sm lg:text-[14.5px] xl:text-[15px] font-extrabold"
              title={t('nav_cikis_yap') || 'Çıkış Yap'}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span>{t('nav_cikis_yap') || 'Çıkış Yap'}</span>
            </button>

          </div>
        </div>
      </header>

      {/* MOBILE HEADER */}
      <header className={`lg:hidden flex items-center justify-between px-6 h-16 border-b backdrop-blur-lg sticky top-0 z-30 transition-colors ${
        isDark ? 'bg-[#0B121F]/90 border-slate-800' : 'bg-white/90 border-slate-200'
      }`}>
        <Link href="/dashboard" className="flex items-center group">
          <span className={`text-xl font-black tracking-tight display-font ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Onay<span className="text-[#4648d4]">TR</span>
          </span>
          <Sparkles className="h-3.5 w-3.5 ml-0.5 mb-2 text-[#4648d4] animate-pulse" />
        </Link>
        
        <div className="flex items-center gap-3">
          {/* Mobile Balance Display */}
          {user && (
            <span className={`text-xs font-black px-2.5 py-1.5 rounded-xl border ${
              isDark ? 'bg-indigo-950/20 border-indigo-900/30 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-[#4648d4]'
            }`}>
              {parseFloat(user.balance || 0).toFixed(1)}₺
            </span>
          )}

          {/* Mobile Announcements Icon */}
          <div className="relative">
            <button
              onClick={handleOpenAnnouncements}
              className={`p-1.5 rounded-lg border cursor-pointer relative ${
                isDark ? 'border-slate-800 text-slate-350 bg-slate-900/50' : 'border-slate-200 text-slate-500 bg-slate-50'
              }`}
            >
              <Bell className="h-4 w-4" />
              {hasNewAnn && (
                <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-rose-500 ring-1 ring-slate-900 animate-pulse" />
              )}
            </button>

            {annOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setAnnOpen(false)} />
                <div className="absolute right-0 top-[calc(100%+8px)] pt-0.5 z-50">
                  <div className={`w-72 rounded-xl border shadow-xl p-3.5 text-left animate-fade-in ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-200 shadow-slate-950/50' : 'bg-white border-slate-200 text-slate-700 shadow-slate-200/50'
                  }`}>
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100/10 dark:border-slate-800/80">
                      <span className="font-extrabold text-xs flex items-center gap-1 text-[#4648d4] dark:text-indigo-400">
                        <Bell className="h-3.5 w-3.5" /> Duyurular
                      </span>
                      {announcements.length > 0 && (
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                          {announcements.length}
                        </span>
                      )}
                    </div>
                    <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                      {announcements.length === 0 ? (
                        <div className="text-center py-4 text-[11px] text-slate-400">
                          Yeni bir duyuru bulunmuyor.
                        </div>
                      ) : (
                        announcements.map((ann) => (
                          <div 
                            key={ann.id} 
                            className={`p-2.5 rounded-lg border transition-all ${
                              isDark 
                                ? 'bg-slate-950/50 border-slate-800/80' 
                                : 'bg-slate-50 border-slate-150'
                            }`}
                          >
                            <h4 className="font-bold text-[11px] text-slate-800 dark:text-slate-100 mb-0.5 leading-snug">{ann.title}</h4>
                            <p className="text-[10px] text-slate-505 dark:text-slate-400 leading-normal whitespace-pre-line">{ann.content}</p>
                            <span className="text-[8px] font-bold text-slate-400 mt-1.5 block text-right">
                              {new Date(ann.createdAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={toggleDark}
            className={`p-1.5 rounded-lg border cursor-pointer ${isDark ? 'border-slate-800 text-yellow-400 bg-slate-900/50' : 'border-slate-200 text-slate-500 bg-slate-50'}`}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          
          {/* Mobile Language Flags Selector (Themed Dropdown) */}
          <div 
            className="relative z-50"
            onMouseEnter={() => setMobileLangOpen(true)}
            onMouseLeave={() => setMobileLangOpen(false)}
          >
            <button 
              onClick={() => setMobileLangOpen(!mobileLangOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-black ${
                isDark ? 'bg-slate-900/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span className={`fi fi-${language === 'tr' ? 'tr' : language === 'en' ? 'gb' : 'az'} h-3.5 w-3.5 rounded-full overflow-hidden shrink-0 block bg-cover`} />
              <span className="uppercase text-[10px] font-black tracking-wider">{language === 'tr' ? 'TR' : language === 'en' ? 'EN' : 'AZ'}</span>
              <ChevronDown className={`h-3 w-3 opacity-60 transition-transform ${mobileLangOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {mobileLangOpen && (
              <div className="absolute right-0 top-[calc(100%-4px)] pt-2.5 z-50">
                <div className={`w-32 rounded-xl border shadow-xl p-1 animate-fade-in ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  {[
                    { code: 'tr', flag: 'tr', label: 'Türkçe' },
                    { code: 'en', flag: 'gb', label: 'English' },
                    { code: 'az', flag: 'az', label: 'Azərbaycanca' }
                  ].filter(item => supportedLangs[item.code as 'tr' | 'en' | 'az'] !== false).map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLanguage(item.code as any);
                        setMobileLangOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-bold transition-all ${
                        language === item.code 
                          ? 'bg-indigo-650 text-white' 
                          : isDark ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`fi fi-${item.flag} h-3.5 w-3.5 rounded-full overflow-hidden shrink-0 block bg-cover`} />
                        <span>{item.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 h-16 border-t backdrop-blur-lg z-50 flex items-center justify-around px-2 shadow-lg ${
        isDark ? 'bg-[#0B121F]/95 border-slate-800' : 'bg-white/95 border-slate-200'
      }`}>
        {navLinks.slice(0, 6).map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
                isActive 
                  ? 'text-[#4648d4]' 
                  : 'text-slate-400'
              }`}
            >
              <Icon className={`h-5.5 w-5.5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[9px] font-bold tracking-tight max-w-[64px] truncate">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
