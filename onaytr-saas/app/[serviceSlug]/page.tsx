"use client";

import { use, useState, useEffect, useMemo } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { useSession } from 'next-auth/react';
import { getCountryFlagCode } from '@/lib/utils/icons';
import { ShieldCheck, Cpu, Smartphone, HelpCircle, ArrowRight, Loader2, Award, Zap, CheckCircle2, ChevronRight } from 'lucide-react';

interface PageProps {
  params: Promise<{ serviceSlug: string }>;
}

// Map slug names to actual service names & visual attributes
const serviceSlugMap: Record<string, { serviceCode: string; iconColor: string; iconBg: string }> = {
  "whatsapp-numara-alma": { serviceCode: "whatsapp", iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10" },
  "telegram-numara-alma": { serviceCode: "telegram", iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
  "instagram-numara-alma": { serviceCode: "instagram", iconColor: "text-pink-500", iconBg: "bg-pink-500/10" },
  "facebook-numara-alma": { serviceCode: "facebook", iconColor: "text-blue-600", iconBg: "bg-blue-600/10" },
  "twitter-numara-alma": { serviceCode: "twitter", iconColor: "text-slate-800 dark:text-white", iconBg: "bg-slate-800/10 dark:bg-white/10" },
  "tiktok-numara-alma": { serviceCode: "tiktok", iconColor: "text-rose-500", iconBg: "bg-rose-500/10" },
  "discord-numara-alma": { serviceCode: "discord", iconColor: "text-indigo-500", iconBg: "bg-indigo-500/10" },
  "openai-numara-alma": { serviceCode: "openai", iconColor: "text-emerald-600", iconBg: "bg-emerald-600/10" },
  "google-numara-alma": { serviceCode: "google", iconColor: "text-red-500", iconBg: "bg-red-500/10" },
  "tinder-numara-alma": { serviceCode: "tinder", iconColor: "text-rose-600", iconBg: "bg-rose-600/10" },
  "claude-sms-onay": { serviceCode: "claudeai", iconColor: "text-amber-600", iconBg: "bg-amber-600/10" },
};

// Detailed service names
const serviceDisplayNames: Record<string, string> = {
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  google: "Google / Gmail",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "Twitter / X",
  discord: "Discord",
  openai: "ChatGPT / OpenAI",
  tiktok: "TikTok",
  tinder: "Tinder",
  claudeai: "Claude AI",
};

// Mapping country provider codes to human-readable names
const countryNamesMap: Record<string, Record<string, string>> = {
  tr: {
    usa: "Amerika Birleşik Devletleri", canada: "Kanada", russia: "Rusya", kazakhstan: "Kazakistan", egypt: "Mısır",
    southafrica: "Güney Afrika", greece: "Yunanistan", netherlands: "Hollanda", belgium: "Belçika", france: "Fransa",
    spain: "İspanya", hungary: "Macaristan", italy: "İtalya", romania: "Romanya", switzerland: "İsviçre",
    austria: "Avusturya", england: "İngiltere", unitedkingdom: "Birleşik Krallık", denmark: "Danimarka",
    sweden: "İsveç", norway: "Norveç", poland: "Polonya", germany: "Almanya", turkey: "Türkiye", india: "Hindistan",
    azerbaijan: "Azerbaycan", georgia: "Gürcistan", kyrgyzstan: "Kırgızistan", uzbekistan: "Özbekistan"
  },
  en: {
    usa: "United States", canada: "Canada", russia: "Russia", kazakhstan: "Kazakhstan", egypt: "Egypt",
    southafrica: "South Africa", greece: "Greece", netherlands: "Netherlands", belgium: "Belgium", france: "France",
    spain: "Spain", hungary: "Hungary", italy: "Italy", romania: "Romania", switzerland: "Switzerland",
    austria: "Austria", england: "England", unitedkingdom: "United Kingdom", denmark: "Denmark",
    sweden: "Sweden", norway: "Norway", poland: "Poland", germany: "Germany", turkey: "Turkey", india: "India",
    azerbaijan: "Azerbaijan", georgia: "Georgia", kyrgyzstan: "Kyrgyzstan", uzbekistan: "Uzbekistan"
  },
  az: {
    usa: "Amerika Birləşmiş Ştatları", canada: "Kanada", russia: "Rusiya", kazakhstan: "Qazaxıstan", egypt: "Misir",
    southafrica: "Cənubi Afrika", greece: "Yunanıstan", netherlands: "Niderland", belgium: "Belçika", france: "Fransa",
    spain: "İspaniya", hungary: "Macarıstan", italy: "İtaliya", romania: "Rumıniya", switzerland: "İsveçrə",
    austria: "Avstriya", england: "İngiltərə", unitedkingdom: "Birləşmiş Krallıq", denmark: "Danimarka",
    sweden: "İsveç", norway: "Norveç", poland: "Polşa", germany: "Almaniya", turkey: "Türkiyə", india: "Hindistan",
    azerbaijan: "Azərbaycan", georgia: "Gürcüstan", kyrgyzstan: "Qırğızıstan", uzbekistan: "Özbəkistan"
  }
};

export default function ServiceSeoPage({ params }: PageProps) {
  const { serviceSlug } = use(params);
  const router = useRouter();
  const { t, language } = useLanguage();
  const { data: session } = useSession();

  // Pricing State
  const [pricingData, setPricingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Validate Slug
  const seoConfig = serviceSlugMap[serviceSlug];
  const { serviceCode, iconColor, iconBg } = seoConfig || { serviceCode: '', iconColor: '', iconBg: '' };
  const serviceName = serviceDisplayNames[serviceCode] || serviceCode;

  useEffect(() => {
    if (!seoConfig) return;
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
  }, [seoConfig]);

  const getCountryName = (code: string) => {
    const list = countryNamesMap[language] || countryNamesMap['tr'];
    return list[code] || code.charAt(0).toUpperCase() + code.slice(1);
  };

  // Compile pricing rows specifically for THIS service
  const serviceRows = useMemo(() => {
    if (!pricingData || !pricingData.detailedPricing) return [];
    
    const rows: { country: string, price: number, stock: number }[] = [];
    const detailed = pricingData.detailedPricing;

    Object.entries(detailed).forEach(([countryCode, services]: [string, any]) => {
      Object.entries(services).forEach(([serviceNameCode, data]: [string, any]) => {
        if (serviceNameCode.toLowerCase() === serviceCode.toLowerCase()) {
          rows.push({
            country: countryCode,
            price: data.minPrice,
            stock: data.totalCount
          });
        }
      });
    });

    return rows.sort((a, b) => a.price - b.price); // Cheapest first
  }, [pricingData, serviceCode]);

  // Q&As inspired by the live site's SEO Q&A section
  const faqs = [
    {
      q: language === 'tr' ? `${serviceName} numara alma işlemi ne kadar sürer?` : `How long does the ${serviceName} number purchase take?`,
      a: language === 'tr'
        ? `Numara seçiminden doğrulama kodunun gelmesine kadar işlem genellikle birkaç dakika içinde tamamlanır. SMS teslimatı ülkeye ve operatöre göre birkaç saniyeden 1–2 dakikaya kadar değişebilir.`
        : `From selecting the number to receiving the verification code, the process usually takes a few minutes. SMS delivery can vary from a few seconds to 1-2 minutes depending on the country and cellular operator.`
    },
    {
      q: language === 'tr' ? `${serviceName} numara alma ücretleri ülkeye göre mi değişir?` : `Do ${serviceName} number fees vary by country?`,
      a: language === 'tr'
        ? `Ücretler, numaranın ülkesine ve kullanılabilirliğine göre değişir. Panel üzerinden güncel fiyatları ve ülke seçeneklerini inceleyebilirsiniz.`
        : `Fees vary depending on the country of the number and its availability. You can view the live prices and country selections via your dashboard.`
    },
    {
      q: language === 'tr' ? `${serviceName} doğrulama kodu gelmezse ne yapılmalıdır?` : `What should I do if the ${serviceName} code does not arrive?`,
      a: language === 'tr'
        ? `Kod gelmezse panelde “SMS bekle” alanından yenilemeyi deneyin. Belirli bir süre içinde kod ulaşmazsa işlem iptal edilir ve bakiye iade edilir.`
        : `If the code does not arrive, try refreshing the SMS waiting screen in your panel. If the code is not received within the specified duration, the transaction will auto-cancel and your balance will be refunded.`
    },
    {
      q: language === 'tr' ? `${serviceName} için alınan numara kaç kez kullanılabilir?` : `How many times can I use the purchased ${serviceName} number?`,
      a: language === 'tr'
        ? `Sunulan numaralar tek kullanımlıktır. Doğrulama tamamlandıktan sonra aynı numara tekrar kullanılamaz; yeni bir işlem için yeni numara almanız gerekir.`
        : `The numbers provided are single-use. Once verification is complete, the same number cannot be used again; you must order a new line for another activation.`
    },
    {
      q: language === 'tr' ? `${serviceName} numara alma yasal mı?` : `Is buying virtual numbers for ${serviceName} legal?`,
      a: language === 'tr'
        ? `Sanal numara ile SMS alımı yasal bir hizmettir. Hizmetin kullanımı ${serviceName} ve diğer platformların kullanım koşullarına uygun olmalıdır.`
        : `Receiving SMS via virtual numbers is a legal service. The usage of this service should comply with the terms and conditions of ${serviceName} and other digital platforms.`
    },
    {
      q: language === 'tr' ? `${serviceName} için alınan numara kalıcı mı, geçici mi?` : `Is the allocated ${serviceName} number permanent or temporary?`,
      a: language === 'tr'
        ? `Numaralar geçici ve tek kullanımlıktır. Yalnızca doğrulama SMS’ini almak için kullanılır; işlem bitince devre dışı kalır. Fiziksel SIM kart veya kalıcı hat teslimatı yapılmaz.`
        : `The numbers are temporary and single-use. They are only utilized to receive the verification SMS, after which they are disabled. No physical SIM or permanent lines are delivered.`
    }
  ];

  if (!seoConfig) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] dark:bg-[#0D1117] pt-28 pb-16 text-left relative overflow-hidden">
      
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4648d4]/5 dark:bg-[#4648d4]/2 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#712ae2]/5 dark:bg-[#712ae2]/2 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute inset-0 micro-grid opacity-75 -z-20"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* HERO SECTION */}
        <div className="grid md:grid-cols-12 gap-8 items-center pt-8">
          
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4648d4]/10 dark:bg-[#4648d4]/20 border border-[#4648d4]/20">
              <Award className="h-4 w-4 text-[#4648d4]" />
              <span className="text-[10px] font-black text-[#4648d4] uppercase tracking-wider">
                {language === 'tr' ? 'Popüler SMS Onay Servisi' : 'Popular SMS Verification'}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white display-font leading-tight">
              {serviceName} <span className="bg-gradient-to-r from-[#4648d4] to-[#712ae2] bg-clip-text text-transparent">Sanal Numara Alma</span> & SMS Onay
            </h1>
            
            <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm leading-relaxed max-w-xl">
              {language === 'tr'
                ? `Kişisel numaranızı paylaşmadan anında ${serviceName} SMS doğrulaması yapın. %100 onay garantili fiziksel SIM kart hatlarıyla saniyeler içinde doğrulama kodunuzu alın.`
                : `Perform ${serviceName} SMS verification instantly without sharing your personal phone number. Receive codes within seconds on physical SIM lines with 100% guarantee.`}
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href={session ? "/dashboard" : "/auth/login"}
                className="bg-gradient-to-r from-[#4648d4] to-[#712ae2] hover:from-[#3b3db8] hover:to-[#5e22be] text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-[#4648d4]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2"
              >
                {language === 'tr' ? 'Hemen Numara Al' : 'Get Number Now'}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#pricing"
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 font-bold px-8 py-3.5 rounded-xl text-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-855"
              >
                {language === 'tr' ? 'Fiyatları İncele' : 'View Pricing'}
              </a>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center">
            <div className={`h-40 w-40 md:h-52 md:w-52 rounded-4xl ${iconBg} flex items-center justify-center border border-[#4648d4]/10 shadow-2xl relative`}>
              <Smartphone className={`h-20 w-20 md:h-28 md:w-28 ${iconColor}`} />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-[#4648d4] to-[#712ae2] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-lg">
                Active SIM
              </div>
            </div>
          </div>

        </div>

        {/* PRICING TABLE SECTION */}
        <div id="pricing" className="space-y-6">
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white display-font">
              {serviceName} {language === 'tr' ? 'Sanal Numara Fiyat Listesi' : 'Virtual Number Pricing'}
            </h2>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              {language === 'tr' ? 'Aktif ülkelerdeki güncel stok miktarları ve minimum bakiye tutarları.' : 'Live stocks and minimum pricing across active countries.'}
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-[#4648d4] animate-spin mb-2" />
              <span className="text-xs text-slate-400 font-bold">{language === 'tr' ? 'Fiyat listesi yükleniyor...' : 'Loading pricing...'}</span>
            </div>
          ) : (
            <div className="glass-premium rounded-3xl shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/10 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-widest">
                      <th className="p-5">{language === 'tr' ? 'Ülke Lokasyonu' : 'Country'}</th>
                      <th className="p-5">{language === 'tr' ? 'Stok Durumu' : 'Stock Status'}</th>
                      <th className="p-5">{language === 'tr' ? 'Onay Ücreti' : 'SMS Price'}</th>
                      <th className="p-5 text-center">{language === 'tr' ? 'İşlem' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {serviceRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors">
                        
                        {/* Country */}
                        <td className="p-5 text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <span className={`fi fi-${getCountryFlagCode(row.country)} rounded-sm shrink-0`} />
                          <span>{getCountryName(row.country)}</span>
                        </td>
                        
                        {/* Stock */}
                        <td className="p-5 text-xs font-bold">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${row.stock > 100 ? 'bg-emerald-500 shadow-sm animate-pulse' : row.stock > 10 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                            <span className="text-slate-700 dark:text-slate-350">{row.stock} {language === 'tr' ? 'aktif hat' : 'active SIMs'}</span>
                          </div>
                        </td>
                        
                        {/* Price */}
                        <td className="p-5 text-sm font-black text-[#4648d4]">
                          {row.price.toFixed(2)} ₺
                        </td>
                        
                        {/* Action */}
                        <td className="p-5 text-center">
                          <a
                            href={session ? "/dashboard" : "/auth/login"}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#4648d4] to-[#712ae2] hover:from-[#3b3db8] hover:to-[#5e22be] text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_12px_rgba(70,72,212,0.15)] hover:shadow-[0_4px_15px_rgba(70,72,212,0.25)]"
                          >
                            {language === 'tr' ? 'Numara Satın Al' : 'Order SIM'}
                            <ChevronRight className="h-3.5 w-3.5" />
                          </a>
                        </td>
                        
                      </tr>
                    ))}

                    {serviceRows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-slate-400 font-bold text-sm">
                          {language === 'tr' ? 'Şu anda bu servis için aktif stok bulunmuyor.' : 'No active SIM slots available for this service currently.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* STEP BY STEP GUIDE */}
        <div className="space-y-6">
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white display-font">
              {language === 'tr' ? `${serviceName} Mobil Onay Kodu Nasıl Alınır?` : `How to Get ${serviceName} Verification Code`}
            </h2>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              {language === 'tr' ? 'Sadece 4 adımda doğrulama işlemini tamamlayın.' : 'Complete the authentication in just 4 simple steps.'}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            
            <div className="glass-premium p-6 rounded-2xl space-y-3 relative overflow-hidden">
              <span className="text-3xl font-black text-[#4648d4]/20 display-font absolute top-2 right-4">01</span>
              <div className="h-10 w-10 bg-[#4648d4]/10 text-[#4648d4] rounded-xl flex items-center justify-center font-bold">1</div>
              <h4 className="text-sm font-black text-slate-800 dark:text-white display-font">{language === 'tr' ? 'Hesap Açın' : 'Register'}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                {language === 'tr' ? 'OnayTR sistemine ücretsiz kayıt olun ve e-posta adresinizi doğrulayın.' : 'Register for a free account and verify your email.'}
              </p>
            </div>

            <div className="glass-premium p-6 rounded-2xl space-y-3 relative overflow-hidden">
              <span className="text-3xl font-black text-[#4648d4]/20 display-font absolute top-2 right-4">02</span>
              <div className="h-10 w-10 bg-[#4648d4]/10 text-[#4648d4] rounded-xl flex items-center justify-center font-bold">2</div>
              <h4 className="text-sm font-black text-slate-800 dark:text-white display-font">{language === 'tr' ? 'Bakiye Yükleyin' : 'Top Up'}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                {language === 'tr' ? 'Kredi kartı veya havale ile 3D secure güvencesiyle anında bakiye yükleyin.' : 'Add credits securely using card payments or transfer.'}
              </p>
            </div>

            <div className="glass-premium p-6 rounded-2xl space-y-3 relative overflow-hidden">
              <span className="text-3xl font-black text-[#4648d4]/20 display-font absolute top-2 right-4">03</span>
              <div className="h-10 w-10 bg-[#4648d4]/10 text-[#4648d4] rounded-xl flex items-center justify-center font-bold">3</div>
              <h4 className="text-sm font-black text-slate-800 dark:text-white display-font">{language === 'tr' ? 'Numara Talep Edin' : 'Order SIM'}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                {language === 'tr' ? 'Ülkeyi seçerek numaranızı alın ve doğrulamak istediğiniz yere numarayı girin.' : 'Choose country and copy the virtual phone number.'}
              </p>
            </div>

            <div className="glass-premium p-6 rounded-2xl space-y-3 relative overflow-hidden">
              <span className="text-3xl font-black text-[#4648d4]/20 display-font absolute top-2 right-4">04</span>
              <div className="h-10 w-10 bg-[#4648d4]/10 text-[#4648d4] rounded-xl flex items-center justify-center font-bold">4</div>
              <h4 className="text-sm font-black text-slate-800 dark:text-white display-font">{language === 'tr' ? 'Kodu Kopyalayın' : 'Get SMS Code'}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                {language === 'tr' ? 'Gelen SMS kodunu panelden kopyalayıp doğrulama alanına yazın.' : 'Copy the incoming verification code from the panel.'}
              </p>
            </div>

          </div>
        </div>

        {/* FEATURES & DETAILS */}
        <div className="grid md:grid-cols-2 gap-8">
          
          <div className="glass-premium p-8 rounded-3xl space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-[#4648d4]/10 text-[#4648d4] flex items-center justify-center">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white display-font">
              {language === 'tr' ? 'Neden OnayTR Sanal Numaraları?' : 'Why Choose OnayTR SIMs?'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
              {language === 'tr'
                ? `OnayTR olarak sanal numara havuzumuzda ucuz sanal VoIP numaraları barındırmıyoruz. Tüm servis hatlarımız global anlaşmalı operatörlerimizin gerçek fiziksel SIM kartlarından sağlanmaktadır. Bu sayede ${serviceName} gibi yüksek güvenlikli uygulamalarda hesabınız bloke edilmez.`
                : `We do not provide cheap VoIP lines. All numbers are real physical SIM cards routed from cellular providers, which ensures that your newly created ${serviceName} accounts won\'t get suspended immediately.`}
            </p>
          </div>

          <div className="glass-premium p-8 rounded-3xl space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100/50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white display-font">
              {language === 'tr' ? 'Süreç Güvencesi & İade Hakları' : 'Process Guarantee & Refunds'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
              {language === 'tr'
                ? `Hattı aldıktan sonra ${serviceName} doğrulama kodu 10 dakika içerisinde sistem paneline yansımazsa ödeme tamamen iptal edilerek bakiye hesabınıza iade edilir. Risk almadan SMS onaylama işlemlerinizi tamamlayabilirsiniz.`
                : `If the ${serviceName} authentication code is not received on the panel within 10 minutes, the transaction is auto-cancelled and the cost is instantly refunded to your balance.`}
            </p>
          </div>

        </div>

        {/* SERVICE SPECIFIC FAQS */}
        <div className="space-y-6">
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white display-font">
              {language === 'tr' ? `${serviceName} SMS Onay Sıkça Sorulan Sorular` : `${serviceName} SMS Verification FAQs`}
            </h2>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              {language === 'tr' ? 'Merak ettiğiniz tüm detayları aşağıda bulabilirsiniz.' : 'Find all the details you might wonder about below.'}
            </p>
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

        {/* SEO ARTICLE SECTION */}
        <div className="glass-premium p-8 md:p-12 rounded-3xl space-y-8 shadow-sm">
          <div className="text-left border-b border-slate-100 dark:border-slate-800 pb-6">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white display-font">
              {language === 'tr' ? `${serviceName} Sanal Numara ve SMS Onay Hizmeti Hakkında` : `About ${serviceName} Virtual Number & SMS Verification`}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-sans font-medium">
            <div className="space-y-4">
              <h3 className="text-base font-black text-slate-800 dark:text-white display-font">
                {language === 'tr' ? `${serviceName} SMS Onay Sitesi` : `${serviceName} Activation Hub`}
              </h3>
              <p>
                {language === 'tr' 
                  ? `İnternet dünyasında gizliliği korumak ve güvenli bir şekilde hesap açmak her geçen gün daha da önem kazanıyor. OnayTR olarak ${serviceName} platformuna kayıt olurken kişisel telefon numaranızı paylaşmak istemediğiniz durumlar için en kaliteli ve ucuz sanal numara çözümlerini sunuyoruz.`
                  : `Protecting your digital privacy has never been more critical. OnayTR offers the highest success-rate virtual numbers for ${serviceName} registration when you prefer not to share your personal mobile number.`}
              </p>
              <p>
                {language === 'tr'
                  ? `Sistemimiz 7/24 tam otomatik altyapı ile çalışır. Dilediğiniz ülkeyi (Amerika, İngiltere, Almanya veya 40+ global lokasyon) seçerek anında tek kullanımlık numaranızı alabilir, saniyeler içinde SMS doğrulama (OTP) kodunuzu ekranda görüntüleyebilirsiniz.`
                  : `Our platform operates on a 24/7 fully automated backend. Select any country of your choice (USA, UK, Germany, or 40+ global locations) to instantly order a virtual line and fetch your SMS validation code.`}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-black text-slate-800 dark:text-white display-font">
                {language === 'tr' ? `Neden ${serviceName} İçin Sanal Numara Almalısınız?` : `Why Use a Virtual Number for ${serviceName}?`}
              </h3>
              <p>
                {language === 'tr'
                  ? `Kendi cep telefonunuzu paylaşmak, verilerinizin reklam veya veri toplama ağlarına sızmasına neden olabilir. Sanal numara kullanarak kişisel gizliliğinizi maksimum düzeyde tutabilir, iş veya test amacıyla birden fazla ${serviceName} hesabı oluşturabilirsiniz.`
                  : `Sharing your personal phone number exposes you to spam calls, marketing networks, or data leaks. Using a virtual phone number keeps your credentials private and lets you manage multiple accounts for business or testing.`}
              </p>
              <p>
                {language === 'tr'
                  ? "OnayTR platformundan satın alınan tüm sanal numaralar, VoIP olmayan, fiziksel şebeke operatörlerine bağlı SIM kart hatlarıdır. Bu sayede hesap açılışlarında veya doğrulama sırasında herhangi bir engellemeyle karşılaşmazsınız."
                  : "All numbers routed through OnayTR are physical cellular SIM cards, not virtual VoIP lines. This guarantees seamless activation without account suspension issues."}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
