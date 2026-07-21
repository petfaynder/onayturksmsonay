"use client";

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { useSession } from 'next-auth/react';
import { Clock, Smartphone, ShieldCheck, CheckCircle2, ChevronRight, HelpCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function NumaraKiralamaPage() {
  const { language } = useLanguage();
  const { data: session } = useSession();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const rentPeriods = [
    { labelTr: "4 Saat", labelEn: "4 Hours", labelAz: "4 Saat", duration: "4h" },
    { labelTr: "12 Saat", labelEn: "12 Hours", labelAz: "12 Saat", duration: "12h" },
    { labelTr: "24 Saat (1 Gün)", labelEn: "24 Hours (1 Day)", labelAz: "24 Saat (1 Gün)", duration: "24h" },
    { labelTr: "72 Saat (3 Gün)", labelEn: "72 Hours (3 Days)", labelAz: "72 Saat (3 Gün)", duration: "72h" },
    { labelTr: "168 Saat (1 Hafta)", labelEn: "168 Hours (1 Week)", labelAz: "168 Saat (1 Həftə)", duration: "168h" }
  ];

  const faqs = [
    {
      q: language === 'tr' ? "Numara kiralama (Rent) ile tek kullanımlık numaranın farkı nedir?" : "What is the difference between number rental and single-use numbers?",
      a: language === 'tr'
        ? "Tek kullanımlık numaralar yalnızca bir adet doğrulama kodu almanızı sağlar ve kod geldikten sonra numara kapanır. Kiralama servisinde ise kiraladığınız süre boyunca (örneğin 24 saat veya 1 hafta) o numaraya dilediğiniz kadar sınırsız sayıda SMS doğrulama kodu alabilirsiniz."
        : "Single-use numbers are valid for one activation code. With number rental, you keep the virtual number active for the duration chosen (e.g. 24 hours or 1 week) and can receive unlimited SMS codes during that period."
    },
    {
      q: language === 'tr' ? "Kiralama süresi bitince numarayı uzatabilir miyim?" : "Can I extend the rental duration when it ends?",
      a: language === 'tr'
        ? "Evet, kiraladığınız numaranın süresi dolmadan önce paneliniz üzerinden kiralama süresini uzatabilirsiniz. Süre dolduktan sonra hat operatör havuzuna geri döneceği için uzatma işlemi yapılamayabilir. Bu nedenle süreyi takip etmeniz önerilir."
        : "Yes, you can extend the rental duration from your dashboard before the active period expires. Once expired, the number returns to the operator pool and cannot be retrieved."
    },
    {
      q: language === 'tr' ? "Hangi servisleri kiralayabilirim?" : "Which services can I rent numbers for?",
      a: language === 'tr'
        ? "WhatsApp, Telegram, Google, Instagram, Discord, Tinder ve 200'den fazla popüler servis için özel kiralama yapabilirsiniz. Ayrıca 'Diğer / Other' seçeneğiyle belirli bir uygulamaya bağlı kalmadan genel SMS alımı da gerçekleştirebilirsiniz."
        : "You can rent numbers for WhatsApp, Telegram, Google, Instagram, Discord, Tinder, and over 200 other services. You can also choose 'Other' for general SMS reception."
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
              <Clock className="h-4 w-4 text-[#4648d4]" />
              <span className="text-[10px] font-black text-[#4648d4] uppercase tracking-wider">
                {language === 'tr' ? 'Uzun Süreli Hat Tahsisi' : 'Long-Term Number Allocation'}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white display-font leading-tight">
              Sanal Numara <span className="bg-gradient-to-r from-[#4648d4] to-[#712ae2] bg-clip-text text-transparent">Kiralama</span> Hizmeti
            </h1>
            
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm leading-relaxed max-w-xl">
              {language === 'tr'
                ? "Sosyal medya hesaplarınız veya ticari otomasyon projeleriniz için haftalık veya aylık sanal numaralar kiralayın. Kiralama süresi boyunca sınırsız sayıda SMS kodu alarak işlemlerinizi kesintisiz sürdürün."
                : "Rent weekly or monthly virtual phone numbers for social automation or messaging platforms. Receive unlimited incoming SMS verification codes during the active lease period."}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href={session ? "/rent" : "/auth/login"}
                className="bg-gradient-to-r from-[#4648d4] to-[#712ae2] hover:from-[#3b3db8] hover:to-[#5e22be] text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-[#4648d4]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2"
              >
                {language === 'tr' ? 'Hemen Kiralama Yap' : 'Rent Number Now'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center">
            <div className="h-40 w-40 md:h-52 md:w-52 rounded-4xl bg-[#4648d4]/10 flex items-center justify-center border border-[#4648d4]/10 shadow-2xl relative">
              <Smartphone className="h-20 w-20 md:h-28 md:w-28 text-[#4648d4]" />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-[#4648d4] to-[#712ae2] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-lg">
                Unlimited SMS
              </div>
            </div>
          </div>
        </div>

        {/* Rental Periods Info */}
        <div className="space-y-6">
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white display-font">
              {language === 'tr' ? 'Kiralama Süreleri ve Seçenekleri' : 'Lease Periods & Options'}
            </h2>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              {language === 'tr' ? 'Sistemimizde desteklenen aktif kiralama paketleri ve periyotları.' : 'Active rental durations supported by our routing network.'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {rentPeriods.map((period, idx) => (
              <div key={idx} className="glass-premium p-6 rounded-2xl shadow-sm text-center flex flex-col justify-between items-center space-y-4 hover:-translate-y-1 transition-all">
                <div className="h-10 w-10 bg-[#4648d4]/10 text-[#4648d4] rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-base font-black text-slate-850 dark:text-white display-font block">
                    {language === 'az' ? period.labelAz : language === 'en' ? period.labelEn : period.labelTr}
                  </span>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold block uppercase tracking-wider mt-1">{period.duration}</span>
                </div>
                <Link
                  href={session ? "/rent" : "/auth/login"}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-[#4648d4]/10 hover:text-[#4648d4] dark:hover:bg-[#4648d4]/20 transition-all flex items-center justify-center gap-1"
                >
                  {language === 'tr' ? 'Seç' : 'Select'} <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="glass-premium p-8 rounded-3xl space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-[#4648d4]/10 text-[#4648d4] flex items-center justify-center">
              <Smartphone className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white display-font">
              {language === 'tr' ? 'Sınırsız SMS Doğrulama' : 'Unlimited Verification Codes'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
              {language === 'tr'
                ? "Kiraladığınız numara süresi boyunca aynı uygulamadan veya farklı platformlardan dilediğiniz kadar sınırsız sayıda doğrulama kodu alabilirsiniz."
                : "Receive unlimited activation codes from the selected application or general SMS platforms as long as your rental period remains active."}
            </p>
          </div>

          <div className="glass-premium p-8 rounded-3xl space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-[#712ae2]/10 text-[#712ae2] flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white display-font">
              {language === 'tr' ? 'Fiziksel Hat Güvencesi' : 'Physical Operator SIMs'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
              {language === 'tr'
                ? "Kiralama havuzumuzdaki tüm numaralar, global mobil şebekelere ait fiziksel SIM kartlardır. VoIP engellemelerinden veya ani kapanma risklerinden korunursunuz."
                : "All phone numbers in our lease pools are physical SIM lines from global operators. This protects your accounts from VoIP flag closures."}
            </p>
          </div>

          <div className="glass-premium p-8 rounded-3xl space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100/50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white display-font">
              {language === 'tr' ? 'Yenileme ve Uzatma Opsiyonu' : 'Extension & Renewal Options'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
              {language === 'tr'
                ? "Kiraladığınız numaranın süresi bitmeden önce, bakiye hesabınız üzerinden kiralama süresini tek tıkla uzatarak numaranın sizde kalmasını sağlayabilirsiniz."
                : "Keep the phone number allocated to you by extending the active lease period before it runs out with a single click on your balance panel."}
            </p>
          </div>

        </div>

        {/* FAQs */}
        <div className="space-y-6">
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white display-font">
              {language === 'tr' ? 'Kiralama Hakkında Sıkça Sorulanlar' : 'Rental FAQ'}
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
