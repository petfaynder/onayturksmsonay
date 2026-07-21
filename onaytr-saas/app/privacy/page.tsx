"use client";

import { useLanguage } from '@/components/LanguageProvider';
import { Shield, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export default function PrivacyPage() {
  const { language } = useLanguage();

  const contentTr = {
    title: "Gizlilik & Çerez Politikası",
    subtitle: "Kişisel verilerinizin korunması ve güvenliği bizim için en yüksek önceliktir.",
    updated: "Son Güncelleme: 12 Temmuz 2026",
    sections: [
      {
        title: "1. Veri Toplama ve İşleme",
        body: "OnayTR platformunu kullanırken, hesabınızın güvenliğini sağlamak, sipariş süreçlerini yönetmek ve dolandırıcılığı önlemek adına aşağıdaki verileri topluyoruz: Hesabınızı oluştururken verdiğiniz e-posta adresi, giriş şifrenizin kriptolanmış tuzlu hash (salted hash) hali, sisteme giriş yaptığınız IP adresleri ve giriş logları, API üzerinden atılan isteklerin teknik logları. Ödeme süreçleri PayTR, Shopier veya Oxapay gibi lisanslı ve güvenli ödeme sağlayıcıları tarafından yürütülür; kredi/banka kartı bilgileriniz hiçbir şekilde bizim sunucularımızda saklanmaz veya işlenmez."
      },
      {
        title: "2. SMS ve Sanal Numara Verilerinin Korunması",
        body: "OnayTR, gizliliğinizi en üst düzeyde korumayı taahhüt eder. Satın aldığınız veya kiraladığınız numaralar ve bu numaralara gelen doğrulama SMS kodları geçicidir. Gelen SMS kodlarının içerikleri ve yönlendirilen sanal numara bilgiği, doğrulama işlemi başarıyla tamamlandığı anda veya 10-20 dakikalık zaman aşımı süresi dolduğunda veritabanımızdan kalıcı ve geri döndürülemez şekilde silinir. Bu veriler hiçbir log dosyasında veya yedekte tutulmaz."
      },
      {
        title: "3. Çerez (Cookie) Politikası",
        body: "Web sitemizin temel işlevlerini yerine getirebilmesi, oturum bilgilerinizin güvenli şekilde korunması ve tercih ettiğiniz dil seçeneğinin hatırlanması amacıyla çerezler (cookies) kullanıyoruz. Çerezler, tarayıcınız aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır. Tarayıcı ayarlarınızdan çerez tercihlerinizi yönetebilir veya çerezleri tamamen silebilirsiniz. Ancak çerezlerin engellenmesi platformun bazı özelliklerinin çalışmamasına neden olabilir."
      },
      {
        title: "4. Veri Güvenliği ve Şifreleme",
        body: "Sistemimizdeki tüm veri trafiği askeri düzeyde 256-bit SSL (Secure Sockets Layer) ve AES şifreleme protokolleri ile korunmaktadır. API entegrasyonlarımız, arka planda 5sim ve herosms gibi küresel sağlayıcılarla uçtan uca şifreli protokoller üzerinden iletişim kurar. Sunucularımızda saklanan tüm veriler düzenli güvenlik taramalarından geçirilmekte ve yetkisiz erişimlere karşı katı erişim kontrol mekanizmalarıyla korunmaktadır."
      },
      {
        title: "5. Üçüncü Şahıslarla Paylaşım",
        body: "OnayTR, kullanıcılarının kişisel verilerini, e-posta adreslerini veya işlem geçmişlerini hiçbir koşulda reklam, pazarlama ya da ticari amaçlarla üçüncü şahıslara veya kurumlara satmaz, kiralamaz veya paylaşmaz. Verileriniz, yalnızca yasal mercilerden (mahkeme, savcılık vb.) gelen resmi ve yasal olarak zorunlu talepler doğrultusunda ilgili makamlarla paylaşılabilir."
      },
      {
        title: "6. Veri Saklama Süreleri ve Kullanıcı Hakları",
        body: "Kişisel verileriniz, hesabınız aktif olduğu sürece sistemlerimizde saklanır. İstediğiniz zaman profiliniz üzerinden üyeliğinizi sonlandırabilir veya verilerinizin silinmesini talep edebilirsiniz. Üyelik iptali durumunda, yasal olarak saklanması zorunlu olan ödeme logları dışındaki tüm kişisel verileriniz (e-posta vb.) sistemlerimizden tamamen temizlenir."
      }
    ]
  };

  const contentEn = {
    title: "Privacy & Cookie Policy",
    subtitle: "The protection and security of your personal data is our highest priority.",
    updated: "Last Updated: July 12, 2026",
    sections: [
      {
        title: "1. Data Collection and Processing",
        body: "When using the OnayTR platform, we collect the following data to ensure account security, manage order processes, and prevent fraud: The email address provided during registration, encrypted salted hash of your login password, IP addresses and access logs, and technical logs of requests sent via API. Payment transactions are processed securely by licensed payment processors like PayTR, Shopier, or Oxapay; your credit/debit card information is never stored or processed on our servers."
      },
      {
        title: "2. Protection of SMS and Virtual Number Data",
        body: "OnayTR is committed to protecting your privacy at the highest level. The virtual numbers purchased or rented and the verification SMS codes received on these numbers are temporary. The contents of incoming SMS codes and virtual number details are permanently and irreversibly deleted from our database as soon as the transaction is completed or upon the 10-20 minute timeout. This data is not stored in any log files or backups."
      },
      {
        title: "3. Cookie Policy",
        body: "We use cookies to enable the essential functions of our website, securely maintain your session, and remember your language preference. Cookies are small text files stored on your device through your browser. You can manage or delete cookies in your browser settings. However, disabling cookies may cause some features of the platform to function incorrectly."
      },
      {
        title: "4. Data Security and Encryption",
        body: "All data traffic in our system is protected by military-grade 256-bit SSL (Secure Sockets Layer) and AES encryption protocols. Our backend API integrations establish end-to-end encrypted connections with global providers such as 5sim and herosms. All data stored on our servers is subject to regular security scans and protected by strict access control mechanisms."
      },
      {
        title: "5. Sharing with Third Parties",
        body: "OnayTR does not sell, rent, or share its users' personal data, email addresses, or transaction histories with third parties or advertising agencies under any circumstances. Your data may only be shared with relevant authorities pursuant to official and legally binding requests from judicial or governmental bodies (courts, prosecutors, etc.)."
      },
      {
        title: "6. Data Retention and User Rights",
        body: "Your personal data is stored in our systems as long as your account remains active. You can terminate your membership or request the deletion of your data through your profile settings at any time. Upon membership termination, all personal data except payment transaction logs that are legally required to be retained will be permanently erased."
      }
    ]
  };

  const contentAz = {
    title: "Məxfilik & Çərəz Siyasəti",
    subtitle: "Şəxsi məlumatlarınızın qorunması və təhlükəsizliyi bizim üçün ən yüksək prioritetdir.",
    updated: "Son Yenilənmə: 12 İyul 2026",
    sections: [
      {
        title: "1. Məlumatların Toplanması və Emalı",
        body: "OnayTR platformasından istifadə edərkən hesab təhlükəsizliyini təmin etmək, sifariş proseslərini idarə etmək və dələduzluğun qarşısını almaq üçün aşağıdakı məlumatları toplayırıq: Qeydiyyat zamanı təqdim etdiyiniz e-poçt ünvanı, şifrənizin kriptoqrafik duzlu hash (salted hash) forması, sistemə daxil olduğunuz IP ünvanları və giriş qeydləri (loglar), API üzərindən göndərilən sorğuların texniki logları. Ödəniş prosesləri PayTR, Shopier və ya Oxapay kimi lisenziyalı ödəniş sistemləri vasitəsilə həyata keçirilir; kart məlumatlarınız heç bir halda serverlərimizdə saxlanılmır."
      },
      {
        title: "2. SMS və Virtual Nömrə Məlumatlarının Qorunması",
        body: "OnayTR məxfiliyinizi ən yüksək səviyyədə qorumağı öhdəsinə götürür. Satın aldığınız və ya icarəyə götürdüyünüz nömrələr və onlara gələn SMS təsdiq kodları müvəqqətdir. Gələn SMS kodlarının məzmunu və nömrə məlumatları əməliyyat uğurla tamamlandıqda və ya 10-20 dəqiqəlik gözləmə müddəti bitdikdə verilənlər bazasından daimi olaraq silinir və heç bir log/yedək faylında saxlanılmır."
      },
      {
        title: "3. Çərəz (Cookie) Siyasəti",
        body: "Veb saytımızın əsas funksiyalarını yerinə yetirməsi, sessiya təhlükəsizliyinin qorunması və dil seçiminizin xatırlanması üçün çərəzlərdən (cookies) istifadə edirik. Çərəzlər brauzeriniz vasitəsilə cihazınıza yazılan kiçik mətn fayllarıdır. Brauzerinizin parametrlərindən çərəzləri silə və ya məhdudlaşdıra bilərsiniz. Çərəzləri söndürdükdə saytın bəzi funksiyaları işləməyə bilər."
      },
      {
        title: "4. Məlumat Təhlükəsizliyi və Şifrələmə",
        body: "Sistemdəki bütün məlumat trafiki 256-bit SSL (Secure Sockets Layer) və AES şifrələmə protokolları ilə qorunur. API inteqrasiyalarımız arxa planda 5sim və herosms kimi qlobal provayderlərlə şifrəli protokollar vasitəsilə əlaqə qurur. Serverlərimizdə saxlanılan bütün məlumatlar mütəmadi olaraq təhlükəsizlik yoxlamalarından keçirilir."
      },
      {
        title: "5. Üçüncü Tərəflərlə Paylaşım",
        body: "OnayTR istifadəçilərinin fərdi məlumatlarını, e-poçt ünvanlarını və ya əməliyyat tarixçələrini heç bir halda reklam və ya kommersiya məqsədilə üçüncü tərəflərə satmır, kirayə vermir və ya paylaşmır. Məlumatlarınız yalnız rəsmi hüquqi sorğular (məhkəmə, prokurorluq və s.) əsasında səlahiyyətli orqanlarla paylaşıla bilər."
      },
      {
        title: "6. Məlumatların Saxlanma Müddəti və İstifadəçi Hüquqları",
        body: "Şəxsi məlumatlarınız hesabınız aktiv olduğu müddətdə sistemimizdə saxlanılır. İstədiyiniz vaxt profilinizdən hesabınızı silə və ya məlumatlarınızın silinməsini tələb edə bilərsiniz. Qeydiyyat ləğv edildikdə, qanuni olaraq saxlanılması məcburi olan ödəniş logları istisna olmaqla, bütün məlumatlarınız sistemlərimizdən tamamilə təmizlənir."
      }
    ]
  };

  const currentContent = language === 'az' ? contentAz : language === 'en' ? contentEn : contentTr;

  return (
    <div className="min-h-screen bg-[#F8F9FF] dark:bg-[#0D1117] pt-28 pb-16 text-left relative overflow-hidden">
      
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4648d4]/5 dark:bg-[#4648d4]/2 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#712ae2]/5 dark:bg-[#712ae2]/2 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute inset-0 micro-grid opacity-75 -z-20"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="h-14 w-14 bg-gradient-to-br from-[#4648d4] to-[#712ae2] rounded-2xl flex items-center justify-center shadow-lg shadow-[#4648d4]/10 mb-4 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white display-font mb-2">{currentContent.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm max-w-md">{currentContent.subtitle}</p>
        </div>

        {/* Content Container */}
        <div className="glass-premium p-8 md:p-10 rounded-3xl shadow-sm space-y-8">
          
          {currentContent.sections.map((section, idx) => (
            <section key={idx} className="space-y-3">
              <h2 className="text-lg font-black text-slate-800 dark:text-white display-font flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#4648d4] rounded-full"></span>
                {section.title}
              </h2>
              <p className="text-slate-650 dark:text-slate-450 text-sm leading-relaxed font-semibold font-sans">
                {section.body}
              </p>
            </section>
          ))}

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-bold">
            <span>{currentContent.updated}</span>
            <div className="flex items-center gap-2 text-slate-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>{language === 'tr' ? 'Verileriniz KVKK/GDPR Uyarınca Şifrelenmektedir' : language === 'az' ? 'Məlumatlarınız KVKK/GDPR-a Uyğun Şifrələnir' : 'Data Encrypted In Compliance with KVKK/GDPR'}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
