"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Send } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

export default function Footer() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const isAuthRoute = pathname && pathname.startsWith('/auth');
  const isAdminRoute = pathname && pathname.startsWith('/admin');

  if (isAuthRoute || isAdminRoute) {
    return null;
  }

  return (
    <footer className="bg-[#0B1C30] pt-24 pb-12 border-t border-white/5 relative z-10 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 px-6 md:px-24 max-w-[1440px] mx-auto mb-20">
        
        {/* About Column */}
        <div className="space-y-6">
          <Link className="text-3xl font-black text-white flex items-center gap-3" href="/">
            <div className="w-9 h-9 bg-[#4648d4] rounded-lg flex items-center justify-center text-white text-xl">O</div>
            OnayTR
          </Link>
          <p className="text-white/50 text-[14.5px] leading-relaxed font-sans">{t('lp_footer_desc')}</p>
          <div className="flex gap-4">
            <a className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#4648d4] transition-all" href="#">
              <Globe className="w-5 h-5 text-white" />
            </a>
            <a className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-[#4648d4] transition-all" href="#">
              <Send className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>

        {/* Services Column */}
        <div>
          <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">{t('lp_footer_services')}</h4>
          <ul className="space-y-4">
            <li><Link className="text-white/50 hover:text-[#4648d4] transition-colors text-[14.5px] font-semibold flex items-center gap-2" href="/whatsapp-numara-alma"><span className="w-1.5 h-1.5 bg-[#4648d4] rounded-full"></span> {t('lp_footer_whatsapp')}</Link></li>
            <li><Link className="text-white/50 hover:text-[#4648d4] transition-colors text-[14.5px] font-semibold flex items-center gap-2" href="/telegram-numara-alma"><span className="w-1.5 h-1.5 bg-[#4648d4] rounded-full"></span> {t('lp_footer_telegram')}</Link></li>
            <li><Link className="text-white/50 hover:text-[#4648d4] transition-colors text-[14.5px] font-semibold flex items-center gap-2" href="/claude-sms-onay"><span className="w-1.5 h-1.5 bg-[#4648d4] rounded-full"></span> {t('lp_footer_claude')}</Link></li>
            <li><Link className="text-white/50 hover:text-[#4648d4] transition-colors text-[14.5px] font-semibold flex items-center gap-2" href="/numara-kiralama"><span className="w-1.5 h-1.5 bg-[#4648d4] rounded-full"></span> {t('lp_footer_rent')}</Link></li>
            <li><Link className="text-white/50 hover:text-[#4648d4] transition-colors text-[14.5px] font-semibold flex items-center gap-2" href="/proxy-satin-al"><span className="w-1.5 h-1.5 bg-[#4648d4] rounded-full"></span> {t('lp_footer_proxy')}</Link></li>
          </ul>
        </div>

        {/* Corporate Column */}
        <div>
          <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">{t('lp_footer_corporate')}</h4>
          <ul className="space-y-4">
            <li><Link className="text-white/50 hover:text-[#4648d4] transition-colors text-[14.5px] font-semibold" href="/hakkimizda">{t('lp_footer_about')}</Link></li>
            <li><Link className="text-white/50 hover:text-[#4648d4] transition-colors text-[14.5px] font-semibold" href="/iletisim">{t('lp_footer_contact')}</Link></li>
            <li><Link className="text-white/50 hover:text-[#4648d4] transition-colors text-[14.5px] font-semibold" href="/blog">{t('nav_blog')}</Link></li>
            <li><Link className="text-white/50 hover:text-[#4648d4] transition-colors text-[14.5px] font-semibold" href="/api-docs">{t('lp_footer_api_doc')}</Link></li>
          </ul>
        </div>

        {/* Legal Column */}
        <div>
          <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">{t('lp_footer_legal')}</h4>
          <ul className="space-y-4">
            <li><Link className="text-white/50 hover:text-[#4648d4] transition-colors text-[14.5px] font-semibold flex items-center gap-2" href="/kullanimkosullari"><span className="w-1.5 h-1.5 bg-[#4648d4] rounded-full"></span> {t('lp_footer_terms')}</Link></li>
            <li><Link className="text-white/50 hover:text-[#4648d4] transition-colors text-[14.5px] font-semibold flex items-center gap-2" href="/gizlilikpolitikasi"><span className="w-1.5 h-1.5 bg-[#4648d4] rounded-full"></span> {t('lp_footer_cookie')}</Link></li>
            <li><Link className="text-white/50 hover:text-[#4648d4] transition-colors text-[14.5px] font-semibold flex items-center gap-2" href="/kvkk"><span className="w-1.5 h-1.5 bg-[#4648d4] rounded-full"></span> {t('lp_footer_kvkk')}</Link></li>
            <li><Link className="text-white/50 hover:text-[#4648d4] transition-colors text-[14.5px] font-semibold flex items-center gap-2" href="/iade-politikasi"><span className="w-1.5 h-1.5 bg-[#4648d4] rounded-full"></span> {t('lp_footer_refund')}</Link></li>
          </ul>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-24 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5 pt-12 text-white/30 text-sm">
        <span>{t('lp_footer_copyright')}</span>
        <span className="mono text-[11px]">v2.5 // PRODUCTION</span>
      </div>
    </footer>
  );
}
