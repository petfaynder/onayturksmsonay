"use client";

import { useLanguage } from '@/components/LanguageProvider';
import { Eye, ShieldCheck, Scale } from 'lucide-react';

export default function KvkkPage() {
  const { language } = useLanguage();

  const contentTr = {
    title: "KVKK Aydınlatma Metni",
    subtitle: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamındaki haklarınız ve bilgilendirme.",
    updated: "Son Güncelleme: 12 Temmuz 2026",
    sections: [
      {
        title: "1. Veri Sorumlusu",
        body: "6698 sayılı Kişisel Verilerin Korunması Kanunu ('KVKK') uyarınca, İngiltere'de kayıtlı olan Webmetri Digital Solutions Ltd (OnayTR) olarak kişisel verilerinizin güvenliğine büyük önem veriyoruz. Firmamız, platformumuz (onaytr.com) üzerinden gerçekleştirdiğiniz işlemler ve sunduğunuz veriler kapsamında 'Veri Sorumlusu' sıfatıyla hareket etmektedir."
      },
      {
        title: "2. İşlenen Kişisel Verileriniz ve Toplama Amacı",
        body: "Platformumuz üzerinden sunulan sanal SMS onay hizmetlerinin sağlıklı bir şekilde ifa edilebilmesi amacıyla; hesabınızı oluştururken beyan ettiğiniz e-posta adresiniz, güvenli ödeme sağlayıcılarımız (PayTR, Shopier, Oxapay) tarafından doğrulanan ödeme logları ve sisteme giriş yaptığınız IP adresleri işlenmektedir. SMS doğrulama amacıyla kullandığınız geçici sanal numaralar ve bu numaralara gelen SMS içerikleri, işlem tamamlandığı anda veya 10-20 dakikalık zaman aşımına uğradığı anda sistemlerimizden kalıcı olarak silinir ve kesinlikle üçüncü taraflarla paylaşılmaz."
      },
      {
        title: "3. Kişisel Verilerin Aktarılması",
        body: "Toplanan kişisel verileriniz, kanuni yükümlülüklerin yerine getirilmesi amacıyla adli ve idari merciler (mahkeme, savcılık, emniyet müdürlüğü vb.) tarafından yasal olarak talep edilmedikçe, hiçbir ticari veya reklam amacıyla üçüncü taraflarla paylaşılmaz, satılmaz veya aktarılmaz. Ödeme loglarınız ve ödeme doğrulama verileriniz sadece finansal süreçlerin tamamlanması adına ilgili aracı ödeme kuruluşlarına (PayTR, Shopier, Oxapay) yasal sınırlar çerçevesinde aktarılır."
      },
      {
        title: "4. Veri Toplama Yöntemi ve Hukuki Sebebi",
        body: "Kişisel verileriniz, sitemizdeki üyelik kayıt formu, ödeme entegrasyon formları ve API üzerinden atılan elektronik istekler vasıtasıyla tamamen dijital ortamda toplanmaktadır. Bu veriler, KVKK'nın 5. maddesinde belirtilen 'sözleşmenin kurulması ve ifası için zorunlu olması', 'veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi' ve 'veri sahibinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaatleri' hukuki sebeplerine dayalı olarak işlenmektedir."
      },
      {
        title: "5. Veri Sahibinin Hakları ve Başvuru",
        body: "KVKK'nın 11. maddesi uyarınca OnayTR'ye başvurarak; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme, verilerinizin silinmesini veya yok edilmesini isteme haklarına sahipsiniz. Haklarınızı kullanmak için sitemizdeki destek talebi panelini kullanabilir veya doğrudan destek@onaytr.com / info@onaytr.com e-posta adresleri üzerinden bizimle iletişime geçebilirsiniz."
      }
    ]
  };

  const contentEn = {
    title: "GDPR & Data Clarification Text",
    subtitle: "Your rights and guidelines regarding personal data protection.",
    updated: "Last Updated: July 12, 2026",
    sections: [
      {
        title: "1. Data Controller",
        body: "Pursuant to the Law on Protection of Personal Data (KVKK) and GDPR, Webmetri Digital Solutions Ltd (OnayTR), registered in the United Kingdom, acts as the 'Data Controller' for the personal data obtained during your use of our platform (onaytr.com). We attach the utmost importance to the security of your personal data."
      },
      {
        title: "2. Processed Data and Purpose",
        body: "In order to properly perform our virtual SMS confirmation services, we process the email address you provide during registration, payment transaction logs verified by our payment processing partners (PayTR, Shopier, Oxapay), and your IP addresses used during login. The virtual numbers used for SMS confirmation and the contents of the SMS codes received are permanently deleted from our database as soon as the transaction is completed or upon the 10-20 minute timeout, and are never shared with third parties."
      },
      {
        title: "3. Transfer of Personal Data",
        body: "Your personal data is not shared with or transferred to any third party for commercial or advertising purposes. It may only be transferred to judicial or administrative authorities (courts, prosecutors, law enforcement) upon official legal request to comply with statutory duties. Payment log and verification data are transferred to our licensed payment partners (PayTR, Shopier, Oxapay) solely for processing transactions."
      },
      {
        title: "4. Method of Data Collection and Legal Grounds",
        body: "Personal data is collected entirely through digital media when you register, make a payment, or issue API requests. These data are processed on the legal grounds of 'necessity for the establishment and performance of a contract,' 'compliance with a legal obligation to which the data controller is subject,' and 'legitimate interests of the data controller, provided that it does not harm the fundamental rights and freedoms of the data subject.'"
      },
      {
        title: "5. Rights of the Data Subject",
        body: "Under data protection regulations, you have the right to apply to OnayTR to learn whether your personal data is processed, request information if processed, learn the purpose of processing, and request the deletion or destruction of your data. To exercise your rights, you can open a support ticket on the dashboard or email us directly at destek@onaytr.com or info@onaytr.com."
      }
    ]
  };

  const contentAz = {
    title: "KVKK Məlumatlandırma Mətni",
    subtitle: "Fərdi Məlumatların Qorunması Qanunu çərçivəsində hüquqlarınız və məlumatlandırma.",
    updated: "Son Yenilənmə: 12 İyul 2026",
    sections: [
      {
        title: "1. Məlumat Məsul Şəxs",
        body: "Fərdi Məlumatların Qorunması Qanunu (KVKK) və GDPR-a əsasən, Böyük Britaniyada qeydiyyatdan keçmiş Webmetri Digital Solutions Ltd (OnayTR) platformamız (onaytr.com) üzərindən əldə edilən fərdi məlumatlarınızın təhlükəsizliyinə böyük önəm verir. Firmamız 'Məlumat Məsul Şəxs' statusunda çıxış edir."
      },
      {
        title: "2. Emal Olunan Fərdi Məlumatlar və Məqsəd",
        body: "Virtual SMS təsdiq xidmətlərimizin düzgün icra edilməsi üçün hesab açarkən təqdim etdiyiniz e-poçt ünvanınız, ödəniş tərəfdaşlarımız (PayTR, Shopier, Oxapay) tərəfindən təsdiqlənən ödəniş logları və giriş IP ünvanlarınız emal olunur. SMS təsdiqi üçün istifadə etdiyiniz nömrələr və onlara gələn SMS-lərin məzmunu əməliyyat tamamlandıqdan dərhal sonra və ya 10-20 dəqiqəlik gözləmə müddəti bitdikdə verilənlər bazasından daimi olaraq silinir."
      },
      {
        title: "3. Fərdi Məlumatların Ötürülməsi",
        body: "Toplanan fərdi məlumatlarınız, qanuni öhdəliklərin yerinə yetirilməsi məqsədilə məhkəmə və ya inzibati orqanlar tərəfindən rəsmi şəkildə tələb edilmədiyi təqdirdə, heç bir kommersiya və ya reklam məqsədilə üçüncü tərəflərlə paylaşılmır və satılmır. Ödəniş məlumatları yalnız maliyyə əməliyyatlarının təsdiqlənməsi üçün müvafiq ödəniş qurumlarına (PayTR, Shopier, Oxapay) ötürülür."
      },
      {
        title: "4. Məlumat Toplama Metodu və Hüquqi Əsaslar",
        body: "Fərdi məlumatlarınız saytımızdakı qeydiyyat forması, ödəniş formaları və API vasitəsilə tamamilə rəqəmsal mühitdə toplanır. Məlumatlar 'müqavilənin bağlanması və icrası üçün zəruri olması', 'məlumat məsul şəxsin hüquqi öhdəliklərinin yerinə yetirilməsi' və 'istifadəçinin əsas hüquq və azadlıqlarına zərər verməmək şərtilə məsul şəxsin qanuni mənafeləri üçün zəruri olması' əsasında emal edilir."
      },
      {
        title: "5. Məlumat Sahibinin Hüquqları və Müraciət",
        body: "Qanunvericiliyə əsasən, OnayTR-ə müraciət edərək fərdi məlumatlarınızın emal edilib-edilmədiyini öyrənmək, emal edilmişdirsə məlumat tələb etmək, məlumatlarınızın silinməsini və ya məhv edilməsini istəmək hüququnuz var. Hüquqlarınızı istifadə etmək üçün sitemizdəki dəstək panelindən istifadə edə bilərsiniz və ya bilavasitə destek@onaytr.com / info@onaytr.com e-poçt ünvanlarına yaza bilərsiniz."
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
            <Scale className="h-6 w-6 text-white" />
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
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>{language === 'tr' ? 'Verileriniz KVKK/GDPR Uyarınca Şifrelenmektedir' : language === 'az' ? 'Məlumatlarınız KVKK/GDPR-a Uyğun Şifrələnir' : 'Data Encrypted In Compliance with KVKK/GDPR'}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
