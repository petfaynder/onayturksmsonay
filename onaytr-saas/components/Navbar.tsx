"use client";

import Link from 'next/link';
import { 
  Bell, 
  Wallet, 
  Maximize, 
  MessageSquare, 
  ListOrdered, 
  Globe, 
  CreditCard, 
  HelpCircle, 
  User, 
  LogOut, 
  Moon,
  Sun,
  ChevronDown,
  Bolt,
  Clock,
  Sparkles,
  LogIn,
  Code,
  Menu,
  X
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const pathname = usePathname();
  const { isDark, toggleDark } = useTheme();
  const { language, setLanguage, t, supportedLangs } = useLanguage();

  const [balanceFlash, setBalanceFlash] = useState<'up' | 'down' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const prevBalanceRef = useRef<number | null>(null);

  // Bakiye değişince flash animasyon tetikle
  useEffect(() => {
    const currentBalance = user?.balance != null ? parseFloat(user.balance) : null;
    if (currentBalance === null) return;

    if (prevBalanceRef.current !== null && prevBalanceRef.current !== currentBalance) {
      const direction = currentBalance > prevBalanceRef.current ? 'up' : 'down';
      setBalanceFlash(direction);
      setTimeout(() => setBalanceFlash(null), 1200);
    }
    prevBalanceRef.current = currentBalance;
  }, [user?.balance]);

  const isDashboardRoute = pathname && (
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/rent') || 
    pathname.startsWith('/balance') || 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/support') || 
    pathname.startsWith('/developer') ||
    pathname.startsWith('/numbers')
  );
  
  const isAuthRoute = pathname && pathname.startsWith('/auth');
  const isAdminRoute = pathname && pathname.startsWith('/admin');

  if (isAdminRoute || isDashboardRoute) {
    return null;
  }

  // 1. AUTH PAGES MINIMAL HEADER
  if (isAuthRoute) {
    return (
      <div className="w-full py-8 flex justify-center relative z-50">
        <Link href="/" className="text-3xl font-black text-[#4648d4] tracking-tighter flex items-center gap-2 group">
          <div className="w-10 h-10 bg-[#4648d4] rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-[#4648d4]/20 group-hover:scale-110 transition-transform">O</div>
          <span className="bg-gradient-to-r from-[#0B1C30] to-[#4648d4] dark:from-white dark:to-slate-350 bg-clip-text text-transparent font-sans">OnayTR</span>
        </Link>
      </div>
    );
  }

  // 2. PUBLIC MARKETING PAGES FLOATING NAVBAR
  if (!isDashboardRoute) {
    return (
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl z-[100] rounded-2xl border border-white/20 dark:border-slate-800/50 shadow-lg backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 transition-all duration-300">
        <div className="flex justify-between items-center px-6 h-16 md:h-20 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-2xl font-black text-[#4648d4] tracking-tighter flex items-center gap-2 group">
              <div className="w-9 h-9 bg-[#4648d4] rounded-xl flex items-center justify-center text-white text-lg shadow-md shadow-[#4648d4]/20 group-hover:scale-110 transition-transform">O</div>
              <span className="bg-gradient-to-r from-[#0B1C30] to-[#4648d4] dark:from-white dark:to-slate-350 bg-clip-text text-transparent font-sans">OnayTR</span>
            </Link>
            
            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-8">
              <Link className={`text-sm font-semibold hover:text-[#4648d4] transition-colors ${pathname === '/services' ? 'text-[#4648d4]' : 'text-slate-600 dark:text-slate-300'}`} href="/services">{t('lp_nav_services')}</Link>
              <Link className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#4648d4] transition-colors" href="/#connectivity">{t('lp_nav_network')}</Link>
              <Link className={`text-sm font-semibold hover:text-[#4648d4] transition-colors ${pathname === '/api-docs' ? 'text-[#4648d4]' : 'text-slate-600 dark:text-slate-300'}`} href="/api-docs">{t('lp_nav_developer')}</Link>
              <Link className={`text-sm font-semibold hover:text-[#4648d4] transition-colors ${pathname?.startsWith('/blog') ? 'text-[#4648d4]' : 'text-slate-600 dark:text-slate-300'}`} href="/blog">{t('nav_blog')}</Link>
              <Link className={`text-sm font-semibold hover:text-[#4648d4] transition-colors ${pathname === '/help' ? 'text-[#4648d4]' : 'text-slate-600 dark:text-slate-300'}`} href="/help">{t('nav_yardim')}</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDark}
              className="p-2 text-slate-500 hover:text-[#4648d4] dark:text-slate-400 dark:hover:text-yellow-400 rounded-lg transition-colors"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Language Flag Buttons */}
            <div className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full">
              {supportedLangs.tr && (
                <button 
                  onClick={() => setLanguage('tr')}
                  className={`h-5 w-5 rounded-full overflow-hidden border relative flex items-center justify-center ${language === 'tr' ? 'border-[#4648d4] scale-105 ring-2 ring-[#4648d4]/10' : 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100 border-transparent'}`}
                >
                  <span className="fi fi-tr !w-full !h-full absolute inset-0 !bg-cover !bg-center" />
                </button>
              )}
              {supportedLangs.en && (
                <button 
                  onClick={() => setLanguage('en')}
                  className={`h-5 w-5 rounded-full overflow-hidden border relative flex items-center justify-center ${language === 'en' ? 'border-[#4648d4] scale-105 ring-2 ring-[#4648d4]/10' : 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100 border-transparent'}`}
                >
                  <span className="fi fi-gb !w-full !h-full absolute inset-0 !bg-cover !bg-center" />
                </button>
              )}
              {supportedLangs.az && (
                <button 
                  onClick={() => setLanguage('az')}
                  className={`h-5 w-5 rounded-full overflow-hidden border relative flex items-center justify-center ${language === 'az' ? 'border-[#4648d4] scale-105 ring-2 ring-[#4648d4]/10' : 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100 border-transparent'}`}
                >
                  <span className="fi fi-az !w-full !h-full absolute inset-0 !bg-cover !bg-center" />
                </button>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              {user ? (
                <Link href="/dashboard" className="bg-[#4648d4] text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-[#4648d4]/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all">
                  {t('lp_nav_account')}
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="text-xs font-bold text-slate-700 dark:text-slate-350 hover:text-[#4648d4] dark:hover:text-[#4648d4] transition-colors px-3 py-2">
                    {t('lp_nav_login')}
                  </Link>
                  <Link href="/auth/register" className="bg-[#0B1C30] dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full text-xs font-bold hover:-translate-y-0.5 active:scale-95 transition-all shadow-md">
                    {t('lp_nav_register')}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 text-slate-600 dark:text-slate-350"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-6 pt-2 pb-6 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 rounded-b-2xl space-y-4 animate-fade-up">
            <div className="flex flex-col gap-3.5">
              <Link 
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-bold ${pathname === '/services' ? 'text-[#4648d4]' : 'text-slate-700 dark:text-slate-300'}`} 
                href="/services"
              >
                {t('lp_nav_services')}
              </Link>
              <Link 
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-700 dark:text-slate-300" 
                href="/#connectivity"
              >
                {t('lp_nav_network')}
              </Link>
              <Link 
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-bold ${pathname === '/api-docs' ? 'text-[#4648d4]' : 'text-slate-700 dark:text-slate-300'}`} 
                href="/api-docs"
              >
                {t('lp_nav_developer')}
              </Link>
              <Link 
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-bold ${pathname?.startsWith('/blog') ? 'text-[#4648d4]' : 'text-slate-700 dark:text-slate-300'}`} 
                href="/blog"
              >
                {t('nav_blog')}
              </Link>
              <Link 
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-bold ${pathname === '/help' ? 'text-[#4648d4]' : 'text-slate-700 dark:text-slate-300'}`} 
                href="/help"
              >
                {t('nav_yardim')}
              </Link>
            </div>
            
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{t('lp_connect_live')}</span>
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full">
                {supportedLangs.tr && <button onClick={() => setLanguage('tr')} className={`h-5 w-5 rounded-full overflow-hidden border ${language === 'tr' ? 'border-[#4648d4]' : 'border-transparent'}`}><span className="fi fi-tr !w-full !h-full block !bg-cover" /></button>}
                {supportedLangs.en && <button onClick={() => setLanguage('en')} className={`h-5 w-5 rounded-full overflow-hidden border ${language === 'en' ? 'border-[#4648d4]' : 'border-transparent'}`}><span className="fi fi-gb !w-full !h-full block !bg-cover" /></button>}
                {supportedLangs.az && <button onClick={() => setLanguage('az')} className={`h-5 w-5 rounded-full overflow-hidden border ${language === 'az' ? 'border-[#4648d4]' : 'border-transparent'}`}><span className="fi fi-az !w-full !h-full block !bg-cover" /></button>}
              </div>
            </div>

            <div className="pt-2">
              {user ? (
                <Link 
                  onClick={() => setMobileMenuOpen(false)}
                  href="/dashboard" 
                  className="block text-center w-full bg-[#4648d4] text-white py-3 rounded-xl text-xs font-bold shadow-lg"
                >
                  {t('lp_nav_account')}
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    onClick={() => setMobileMenuOpen(false)}
                    href="/auth/login" 
                    className="block text-center border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl text-xs font-bold"
                  >
                    {t('lp_nav_login')}
                  </Link>
                  <Link 
                    onClick={() => setMobileMenuOpen(false)}
                    href="/auth/register" 
                    className="block text-center bg-[#0B1C30] dark:bg-white text-white dark:text-slate-900 py-3 rounded-xl text-xs font-bold"
                  >
                    {t('lp_nav_register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    );
  }

  // 3. DASHBOARD PAGE ORIGINAL HEADER (UNTOUCHED)
  const balance = user?.balance != null ? parseFloat(user.balance as any) : null;

  return (
    <div className="w-full relative z-50 px-4 pt-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
      
      {/* GitHub Light/Dark Styled Header */}
      <div
        data-navbar
        className={`flex flex-col overflow-visible border rounded-md transition-all duration-350 ${
          isDark
            ? 'bg-[#161B22] border-[#30363D] text-[#E6EDF3] shadow-[0_1px_0_rgba(0,0,0,0.4)]'
            : 'bg-[#f6f8fa] border-[#d0d7de] text-[#24292f] shadow-[0_1px_0_rgba(27,31,35,0.04)]'
        }`}
      >
        
        {/* Top Header */}
        <div className={`px-6 py-3 flex items-center justify-between border-b ${isDark ? 'border-[#30363D]' : 'border-[#d0d7de]'}`}>
          
          {/* Logo area */}
          <div className="flex items-center gap-4">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center group relative">
              <div className="absolute -inset-2 bg-teal-400/10 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className={`text-xl font-bold tracking-tight flex items-center display-font relative z-10 ${isDark ? 'text-[#E6EDF3]' : 'text-[#24292f]'}`}>
                Onay<span className="text-[#1f883d]">TR</span>
                <Sparkles className="h-4 w-4 ml-1 mb-2.5 text-[#1f883d] animate-pulse" />
              </div>
            </Link>
          </div>

          {/* Right Menu */}
          <div className="flex items-center gap-4">
            
            {/* Language Flags */}
            <div className={`hidden md:flex items-center gap-2 p-1.5 border rounded-full shadow-inner ${isDark ? 'bg-[#0D1117] border-[#30363D]' : 'bg-[#ffffff] border-[#d0d7de]'}`}>
              {supportedLangs.tr && (
                <button 
                  onClick={() => setLanguage('tr')}
                  title="Türkçe"
                  className={`h-6 w-6 rounded-full overflow-hidden border relative transform hover:scale-105 transition-all flex items-center justify-center ${language === 'tr' ? 'border-teal-500 scale-105 ring-2 ring-teal-500/20' : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100 border-transparent bg-slate-50'}`}
                >
                  <span className="fi fi-tr !w-full !h-full absolute inset-0 !bg-cover !bg-center" />
                </button>
              )}
              {supportedLangs.en && (
                <button 
                  onClick={() => setLanguage('en')}
                  title="English"
                  className={`h-6 w-6 rounded-full overflow-hidden border relative transform hover:scale-105 transition-all flex items-center justify-center ${language === 'en' ? 'border-teal-500 scale-105 ring-2 ring-teal-500/20' : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100 border-transparent bg-slate-50'}`}
                >
                  <span className="fi fi-gb !w-full !h-full absolute inset-0 !bg-cover !bg-center" />
                </button>
              )}
              {supportedLangs.az && (
                <button 
                  onClick={() => setLanguage('az')}
                  title="Azərbaycan"
                  className={`h-6 w-6 rounded-full overflow-hidden border relative transform hover:scale-105 transition-all flex items-center justify-center ${language === 'az' ? 'border-teal-500 scale-105 ring-2 ring-teal-500/20' : 'opacity-60 grayscale hover:grayscale-0 hover:opacity-100 border-transparent bg-slate-50'}`}
                >
                  <span className="fi fi-az !w-full !h-full absolute inset-0 !bg-cover !bg-center" />
                </button>
              )}
            </div>

            {/* Notification Bell */}
            {user && (
              <button className={`relative p-2 border rounded-md transition-all shadow-sm group ${isDark ? 'bg-[#21262D] border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#30363D]' : 'bg-[#ffffff] border-[#d0d7de] text-[#57606a] hover:text-[#24292f] hover:bg-[#f6f8fa]'}`}>
                <Bell className="h-4.5 w-4.5 group-hover:animate-bounce" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#cf222e] text-white text-[9px] font-black flex items-center justify-center rounded-full border border-white shadow-sm">1</span>
              </button>
            )}

            {/* Balance or Login Button */}
            {user ? (
              <Link
                href="/balance"
                className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-sm border font-bold text-xs group transition-all relative overflow-hidden ${
                  balanceFlash === 'up'
                    ? 'bg-emerald-500 border-emerald-500 text-white scale-105'
                    : balanceFlash === 'down'
                    ? 'bg-rose-500 border-rose-500 text-white scale-105'
                    : 'bg-[#1f883d] hover:bg-[#1a7f31] text-white border-[#1f883d]/80'
                }`}
                style={{ transition: 'background-color 0.4s, transform 0.3s, border-color 0.4s' }}
              >
                <Wallet className="h-4 w-4 opacity-90 group-hover:rotate-12 transition-transform shrink-0" />
                <div className="flex items-baseline gap-0.5">
                  <span
                    className={`tracking-tight tabular-nums transition-all duration-300 ${
                      balanceFlash ? 'font-black scale-110' : ''
                    }`}
                  >
                    {balance !== null ? balance.toFixed(2) : '0.00'}
                  </span>
                  <span className="text-[10px] opacity-80">₺</span>
                </div>
                {balanceFlash === 'up' && (
                  <span className="absolute inset-0 bg-emerald-400/30 animate-ping rounded-md pointer-events-none" />
                )}
                {balanceFlash === 'down' && (
                  <span className="absolute inset-0 bg-rose-400/30 animate-ping rounded-md pointer-events-none" />
                )}
              </Link>
            ) : (
              <Link href="/auth/login" className={`flex items-center gap-1.5 px-4 py-2 rounded-md border shadow-sm font-semibold text-xs transition-all ${isDark ? 'bg-[#21262D] border-[#30363D] text-[#E6EDF3] hover:bg-[#30363D]' : 'bg-[#f6f8fa] border-[#d0d7de] text-[#24292f] hover:bg-[#eaeef2]'}`}>
                <LogIn className="h-4 w-4 opacity-80" />
                {t('nav_giris_yap')}
              </Link>
            )}

            {/* Fullscreen */}
            <button className={`hidden md:flex p-2 border rounded-md transition-all shadow-sm ${isDark ? 'bg-[#21262D] border-[#30363D] text-[#8B949E] hover:bg-[#30363D] hover:text-[#E6EDF3]' : 'bg-[#ffffff] border-[#d0d7de] text-[#57606a] hover:bg-[#f6f8fa] hover:text-[#24292f]'}`}>
              <Maximize className="h-4.5 w-4.5" />
            </button>

          </div>
        </div>

        {/* Horizontal Menu */}
        <div className="px-4 py-2">
          <ul className={`flex flex-wrap items-center justify-center gap-1.5 md:gap-2 text-[13px] font-semibold ${isDark ? 'text-[#E6EDF3]' : 'text-[#24292f]'}`}>
            
            {/* Numara Al Dropdown */}
            <li className="relative group">
              <button className={`flex items-center gap-1.5 px-3 py-2 border rounded-md shadow-sm transition-all ${isDark ? 'bg-[#21262D] border-[#30363D] text-[#E6EDF3] hover:bg-[#30363D]' : 'bg-[#ffffff] border-[#d0d7de] text-[#24292f] hover:bg-[#f6f8fa]'}`}>
                <MessageSquare className="h-4 w-4 text-[#0969da]" />
                {t('nav_numara_al')}
                <ChevronDown className="h-3.5 w-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-300" />
              </button>
              
              {/* Dropdown menu */}
              <div className={`absolute top-full left-0 mt-1.5 w-64 border p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-350 z-50 transform origin-top-left group-hover:scale-100 scale-95 rounded-md shadow-lg ${isDark ? 'bg-[#161B22] border-[#30363D]' : 'bg-[#ffffff] border-[#d0d7de]'}`}>
                <div className="flex flex-col gap-1">
                  <Link href={user ? "/dashboard" : "/auth/login"} className={`flex items-start gap-2.5 p-2 rounded border border-transparent transition-all ${isDark ? 'hover:bg-[#21262D]' : 'hover:bg-[#f6f8fa]'}`}>
                    <div className="h-8.5 w-8.5 rounded bg-[#ddf4ff] text-[#0969da] flex items-center justify-center shrink-0 border border-[#58a6ff]/20">
                       <Bolt className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex flex-col text-left">
                       <span className={`font-semibold text-xs ${isDark ? 'text-[#E6EDF3]' : 'text-[#24292f]'}`}>{t('nav_tek_kullanimlik')}</span>
                       <span className="text-[9px] font-bold text-[#b07800] bg-[#fff8eb] px-1.5 py-0.5 rounded border border-[#ffab70]/20 w-fit mt-0.5">{t('nav_en_populer')}</span>
                    </div>
                  </Link>
                  <Link href="/rent" className={`flex items-start gap-2.5 p-2 rounded border border-transparent transition-all ${isDark ? 'hover:bg-[#21262D]' : 'hover:bg-[#f6f8fa]'}`}>
                    <div className="h-8.5 w-8.5 rounded bg-[#f2e7fc] text-[#8250df] flex items-center justify-center shrink-0 border border-[#8250df]/10">
                       <Clock className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className={`font-semibold text-xs flex items-center gap-1.5 ${isDark ? 'text-[#E6EDF3]' : 'text-[#24292f]'}`}>
                        {t('nav_kiralik')}
                        <span className="text-[8px] font-black text-white bg-[#cf222e] px-1 rounded shadow-sm">{t('nav_yeni')}</span>
                      </span>
                      <span className={`text-[10px] font-medium mt-0.5 ${isDark ? 'text-[#8B949E]' : 'text-[#57606a]'}`}>{t('nav_sureli_sms')}</span>
                    </div>
                  </Link>
                </div>
              </div>
            </li>

            {user && [
              { href: '/numbers', icon: ListOrdered, translationKey: 'nav_numaralarim' },
              { href: '/balance', icon: CreditCard, translationKey: 'nav_bakiye_yukle' },
              { href: '/developer', icon: Code, translationKey: 'nav_api_webhook' },
            ].map((item, idx) => (
              <li key={idx}>
                <Link 
                  href={item.href} 
                  className={`flex items-center gap-1.5 px-3 py-2 bg-transparent border border-transparent rounded-md transition-all ${isDark ? 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] hover:border-[#30363D]' : 'text-[#57606a] hover:text-[#24292f] hover:bg-[#ffffff] hover:shadow-sm hover:border-[#d0d7de]'}`}
                >
                  <item.icon className="h-4 w-4 opacity-75" /> {t(item.translationKey as any)}
                </Link>
              </li>
            ))}

            {[
              { href: '/support', icon: Bell, translationKey: 'nav_destek' },
              { href: '/help', icon: HelpCircle, translationKey: 'nav_yardim' },
            ].map((item, idx) => (
              <li key={idx}>
                <Link 
                  href={item.href} 
                  className={`flex items-center gap-1.5 px-3 py-2 bg-transparent border border-transparent rounded-md transition-all ${isDark ? 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] hover:border-[#30363D]' : 'text-[#57606a] hover:text-[#24292f] hover:bg-[#ffffff] hover:shadow-sm hover:border-[#d0d7de]'}`}
                >
                  <item.icon className="h-4 w-4 opacity-75" /> {t(item.translationKey as any)}
                </Link>
              </li>
            ))}

            {user && (
              <li key="profile">
                <Link 
                  href="/profile" 
                  className={`flex items-center gap-1.5 px-3 py-2 bg-transparent border border-transparent rounded-md transition-all ${isDark ? 'text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] hover:border-[#30363D]' : 'text-[#57606a] hover:text-[#24292f] hover:bg-[#ffffff] hover:shadow-sm hover:border-[#d0d7de]'}`}
                >
                  <User className="h-4 w-4 opacity-75" /> {t('nav_profilim')}
                </Link>
              </li>
            )}

            <li className="ml-auto flex items-center gap-1">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDark}
                title={isDark ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
                className={`flex items-center justify-center h-9 w-9 border border-transparent rounded-md transition-all ${isDark ? 'text-yellow-400 hover:bg-[#21262D] hover:border-[#30363D]' : 'text-[#57606a] hover:text-[#24292f] hover:bg-[#ffffff] hover:shadow-sm hover:border-[#d0d7de]'}`}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              
              {user && (
                <button 
                  onClick={() => signOut()} 
                  className={`flex items-center justify-center h-9 w-9 border border-transparent rounded-md transition-all ${isDark ? 'text-[#8B949E] hover:text-red-400 hover:bg-[#21262D] hover:border-[#30363D]' : 'text-[#57606a] hover:text-[#cf222e] hover:bg-[#ffffff] hover:shadow-sm hover:border-[#d0d7de]'}`}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </li>

          </ul>
        </div>

      </div>
    </div>
  );
}
