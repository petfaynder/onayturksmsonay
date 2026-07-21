"use client";

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { useSession } from 'next-auth/react';
import { ShieldCheck, Globe, Cpu, CheckCircle2, ChevronRight, HelpCircle, ArrowRight, Server } from 'lucide-react';
import Link from 'next/link';

export default function ProxySatinAlPage() {
  const { language } = useLanguage();
  const { data: session } = useSession();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const proxyPlans = [
    { nameTr: "1 GB Mobil Paket", nameEn: "1 GB Mobile Package", nameAz: "1 GB Mobil Paket", price: "99.00 ₺", bandwidth: "1 GB", type: "Rotating 4G/LTE" },
    { nameTr: "5 GB Mobil Paket", nameEn: "5 GB Mobile Package", nameAz: "5 GB Mobil Paket", price: "399.00 ₺", bandwidth: "5 GB", type: "Rotating 4G/LTE", popular: true },
    { nameTr: "10 GB Mobil Paket", nameEn: "10 GB Mobile Package", nameAz: "10 GB Mobil Paket", price: "699.00 ₺", bandwidth: "10 GB", type: "Rotating 4G/LTE" }
  ];

  const faqs = [
    {
      q: language === 'tr' ? "SMS onay botlarında neden proxy kullanmalıyım?" : "Why should I use proxies in SMS confirmation bots?",
      a: language === 'tr'
        ? "WhatsApp, Telegram veya Google gibi büyük platformlar, aynı IP adresi üzerinden arka arkaya gelen hesap açma isteklerini hızlıca tespit edip engeller. OnayTR mobil ve konut (residential) proxy servisleri ile her istekte farklı bir hücresel veya ev IP adresi kullanarak bu engelleri kolayca aşabilir ve botlarınızın banlanma riskini sıfıra indirebilirsiniz."
        : "Large platforms like WhatsApp, Telegram, or Google quickly detect and ban accounts created sequentially from the same IP. By utilizing OnayTR mobile/residential proxies, you rotate your IP address for every request, reducing account flags and bans to zero."
    },
    {
      q: language === 'tr' ? "Proxyler hangi protokolleri destekliyor?" : "Which protocols do the proxies support?",
      a: language === 'tr'
        ? "Proxy ağımız hem HTTP hem de yüksek güvenlikli SOCKS5 protokollerini tam olarak desteklemektedir. Bu sayede tüm yazılımlar, tarayıcılar ve özel otomasyon botları ile sorunsuz şekilde entegre olurlar."
        : "Our proxy servers support both HTTP and secure SOCKS5 protocols, ensuring seamless integration with all automation scripts, browsers, and custom software bots."
    },
    {
      q: language === 'tr' ? "IP adresi ne kadar sürede bir değişiyor (Rotate)?" : "How often does the IP address rotate?",
      a: language === 'tr'
        ? "Mobil ve konut paketlerimizde IP adresleri her istekte (request) değişebileceği gibi, isterseniz paneliniz üzerinden 5 ila 30 dakika arasında sabit kalacak şekilde (sticky IP) zamanlanmış rotasyon ayarı yapabilirsiniz."
        : "In our mobile and residential proxy pools, you can rotate the IP address per request, or choose sticky durations ranging from 5 to 30 minutes depending on your software needs."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FF] dark:bg-[#0D1117] pt-28 pb-16 text-left relative overflow-hidden">
      
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4648d4]/5 dark:bg-[#4648d4]/2 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#712ae2]/5 dark:bg-[#712ae2]/2 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute inset-0 micro-grid opacity-75 -z-20"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Hero Section */}
        <div className="grid md:grid-cols-12 gap-8 items-center pt-8">
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4648d4]/10 dark:bg-[#4648d4]/20 border border-[#4648d4]/20">
              <Server className="h-4 w-4 text-[#4648d4]" />
              <span className="text-[10px] font-black text-[#4648d4] uppercase tracking-wider">
                {language === 'tr' ? 'Yüksek Hızlı Proxy Havuzu' : 'High Speed Proxy Pool'}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white display-font leading-tight">
              Mobil & Konut <span className="bg-gradient-to-r from-[#4648d4] to-[#712ae2] bg-clip-text text-transparent">Proxy</span> Satın Al
            </h1>
            
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm leading-relaxed max-w-xl">
              {language === 'tr'
                ? "SMS onay botlarınız, sosyal medya hesap yöneticileriniz ve web scraping projeleriniz için 4G/LTE mobil şebeke gücüne ve konut IP temizliğine sahip Socks5/HTTP proxy paketleri."
                : "HTTP/Socks5 proxy packages with 4G/LTE mobile network strength and clean residential IP pools, tailored for SMS confirmation bots and scraping scripts."}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href={session ? "/dashboard" : "/auth/login"}
                className="bg-gradient-to-r from-[#4648d4] to-[#712ae2] hover:from-[#3b3db8] hover:to-[#5e22be] text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-[#4648d4]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2"
              >
                {language === 'tr' ? 'Hemen Satın Al' : 'Buy Proxies Now'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center">
            <div className="h-40 w-40 md:h-52 md:w-52 rounded-4xl bg-[#4648d4]/10 flex items-center justify-center border border-[#4648d4]/10 shadow-2xl relative">
              <Globe className="h-20 w-20 md:h-28 md:w-28 text-[#4648d4]" />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-[#4648d4] to-[#712ae2] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-lg">
                4G/LTE Rotating
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="space-y-6">
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white display-font">
              {language === 'tr' ? 'Mobil ve Konut Proxy Paketleri' : 'Proxy Plan Packages'}
            </h2>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              {language === 'tr' ? 'İhtiyacınıza uygun kotalı yüksek hızlı bağlantı planları.' : 'Bandwidth based high speed proxy connectivity plans.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {proxyPlans.map((plan, idx) => (
              <div key={idx} className={`glass-premium p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between space-y-6 hover:-translate-y-1 transition-all ${plan.popular ? 'border-[#4648d4]/30 ring-2 ring-[#4648d4]/10 shadow-lg' : 'shadow-sm'}`}>
                {plan.popular && (
                  <span className="absolute top-3 right-3 bg-gradient-to-r from-[#4648d4] to-[#712ae2] text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded">
                    {language === 'tr' ? 'En Popüler' : 'Popular'}
                  </span>
                )}
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">{plan.type}</span>
                  <h3 className="text-xl font-black text-slate-850 dark:text-white display-font mt-2">
                    {language === 'az' ? plan.nameAz : language === 'en' ? plan.nameEn : plan.nameTr}
                  </h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-black text-[#4648d4] display-font">{plan.price}</span>
                  </div>
                  <ul className="mt-6 space-y-3 font-semibold text-xs text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> <span>{language === 'tr' ? `Kota: ${plan.bandwidth}` : `Bandwidth: ${plan.bandwidth}`}</span></li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> <span>{language === 'tr' ? "Sınırsız Anlık Bağlantı (Thread)" : "Unlimited Concurrent Threads"}</span></li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> <span>{language === 'tr' ? "API ile Otomatik IP Yenileme" : "API Link for Instant Rotation"}</span></li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> <span>{language === 'tr' ? "HTTP & SOCKS5 Protokolleri" : "Dual HTTP / SOCKS5 Support"}</span></li>
                  </ul>
                </div>
                <Link
                  href={session ? "/dashboard" : "/auth/login"}
                  className="w-full py-3 bg-gradient-to-r from-[#4648d4] to-[#712ae2] hover:from-[#3b3db8] hover:to-[#5e22be] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {language === 'tr' ? 'Paketi Satın Al' : 'Purchase Package'}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="glass-premium p-8 rounded-3xl space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-[#4648d4]/10 text-[#4648d4] flex items-center justify-center">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white display-font">
              {language === 'tr' ? '40M+ Mobil IP Havuzu' : '40M+ Mobile IP Pool'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
              {language === 'tr'
                ? "Global operatörlere bağlı devasa IP havuzumuz sayesinde botlarınız hiçbir engelle karşılaşmadan ve banlanma riski olmadan çalışır."
                : "With access to a massive operator IP network, your automation scripts run smoothly without being flagged or blocked."}
            </p>
          </div>

          <div className="glass-premium p-8 rounded-3xl space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-[#712ae2]/10 text-[#712ae2] flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white display-font">
              {language === 'tr' ? 'En Temiz Konut IP Adresleri' : 'Clean Residential IPs'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
              {language === 'tr'
                ? "Platformlar tarafından güvenli kabul edilen gerçek ev interneti abonelerine ait IP adresleri sayesinde bot işlemleriniz tamamen insan davranışı gibi algılanır."
                : "Real residential IP blocks ensure that your connections appear organic and bypass strict security controls."}
            </p>
          </div>

          <div className="glass-premium p-8 rounded-3xl space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100/50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450 flex items-center justify-center">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white display-font">
              {language === 'tr' ? 'Kolay API Rotasyonu' : 'Instant API Rotation'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
              {language === 'tr'
                ? "Size özel API linkini tetikleyerek IP adresinizi dilediğiniz an değiştirebilir, otomasyon botlarınızın akışına göre IP rotasyonunu kontrol edebilirsiniz."
                : "Trigger your custom API endpoints to rotate IPs on demand or set timed intervals to match your script automation requirements."}
            </p>
          </div>

        </div>

        {/* FAQs */}
        <div className="space-y-6">
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white display-font">
              {language === 'tr' ? 'Proxy Hakkında Sıkça Sorulanlar' : 'Proxy FAQ'}
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="glass-premium overflow-hidden rounded-2xl shadow-sm transition-all">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 flex items-center justify-between text-left font-bold text-slate-850 dark:text-slate-200 text-[15px]"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight className={`h-4 w-4 text-[#4648d4] shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-semibold border-t border-slate-100/50 dark:border-slate-800/50 font-sans">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
