"use client";

import { useLanguage } from '@/components/LanguageProvider';
import { CreditCard, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function RefundPage() {
  const { language } = useLanguage();

  const contentTr = {
    title: "İade Politikası & Mesafeli Satış",
    subtitle: "OnayTR bakiye yükleme, işlem iptalleri ve iade şartları koşulları.",
    updated: "Son Güncelleme: 12 Temmuz 2026",
    sections: [
      {
        title: "1. Bakiye Yükleme Koşulları",
        body: "OnayTR platformu üzerinden sanal numaralar satın alabilmek ve numara kiralayabilmek amacıyla hesabınıza PayTR, Shopier veya Oxapay güvencesiyle kredi kartı, banka kartı, havale/EFT veya kripto para ile bakiye yüklemesi yapabilirsiniz. Yüklenen tutarlar sistemimiz tarafından anında doğrulanır ve otomatik olarak OnayTR üye hesabınıza bakiye olarak tanımlanır. Kullanıcı, mevcut bakiye miktarını istediği an üye panelinden ve API sorgusu üzerinden görüntüleyebilir."
      },
      {
        title: "2. %100 SMS Kod Gelmeme İade Garantisi",
        body: "Satın aldığınız tek kullanımlık sanal numaralara 10-20 dakika içinde (veya kiralık numaralarda kiralama süresi başlamadan önce) doğrulamak istediğiniz platform tarafından SMS ulaştırılmazsa, sistem işlemi otomatik veya manuel olarak iptal eder. İptal edilen tüm siparişlerin bedeli, hiçbir kesinti veya komisyon uygulanmaksızın anında ve tam olarak OnayTR hesap bakiyenize iade edilir. Kullanıcı SMS kodu alamadığı hiçbir numara için ücret ödemez ve herhangi bir finansal kayba uğramaz."
      },
      {
        title: "3. Nakit İade Koşulları ve Kısıtlamalar",
        body: "Sanal SMS doğrulama hizmetlerinin dijital ve anlık niteliği gereği, OnayTR hesabına yüklenen ve kısmen veya tamamen kullanılan bakiyelerin banka kartına veya banka hesabına nakdi (para olarak) geri ödenmesi mümkün değildir. Yüklenen tüm bakiyeler yalnızca OnayTR sistemi içinde sunulan tek kullanımlık numara alma, numara kiralama veya diğer servisleri satın almak amacıyla kullanılabilir. Yüklenen bakiyeler başka üyelere transfer edilemez veya devredilemez."
      },
      {
        title: "4. Cayma Hakkı İstisnası",
        body: "6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin (ğ) bendi uyarınca, 'elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmeler' cayma hakkının istisnaları kapsamında yer almaktadır. Bu doğrultuda, platforma yüklenen bakiyeler ve satın alınan sanal numaralar anında kullanıma sunulduğundan, satın alım sonrasında yasal cayma hakkı kapsamında nakit iade talebi yapılamaz."
      },
      {
        title: "5. Kötüye Kullanım ve Güvenlik Bloke Kuralları",
        body: "Kullanıcıların sunucu açıklarından faydalanarak manipülatif işlemler gerçekleştirmesi, hatalı veya spam API istekleriyle sistemi sabote etmesi, çalıntı kartlar veya yasa dışı ödeme yöntemleri kullanması durumunda, OnayTR kullanıcının hesabını askıya alma ve mevcut bakiyesini süresiz bloke etme hakkını saklı tutar. Ayrıca bu tür şüpheli finansal işlemler yasal mercilere (MASAK, Cumhuriyet Başsavcılıkları vb.) bildirilir."
      }
    ]
  };

  const contentEn = {
    title: "Refund & Distance Sales Policy",
    subtitle: "OnayTR balance deposits, transaction cancellations, and refund regulations.",
    updated: "Last Updated: July 12, 2026",
    sections: [
      {
        title: "1. Balance Deposit Terms",
        body: "To purchase virtual numbers or rent numbers on the OnayTR platform, you can deposit balance using credit card, debit card, bank transfer, or cryptocurrency secured by PayTR, Shopier, or Oxapay. Deposited amounts are instantly verified and automatically credited to your OnayTR account. The User can view their current balance amount on the user dashboard or via API query at any time."
      },
      {
        title: "2. 100% SMS Refund Guarantee",
        body: "If no verification SMS is received on a single-use virtual number within 10-20 minutes (or on a rented number before the rental starts) from the target platform, the system cancels the transaction automatically or manually. The full cost of all cancelled transactions is instantly returned to the User's OnayTR balance without any fees or commissions. The User is not charged for any number that does not receive an SMS code and incurs no financial loss."
      },
      {
        title: "3. Cash Refund Policy and Restrictions",
        body: "Due to the digital and instant nature of virtual SMS confirmation services, balances deposited to an OnayTR account and partially or fully consumed cannot be refunded as cash to a bank card or bank account. All deposited balances can only be used to purchase services (one-time numbers, number rentals) within the OnayTR system. Deposited balances are non-transferable to other users."
      },
      {
        title: "4. Right of Withdrawal Exception",
        body: "In accordance with Article 15(ğ) of the Regulation on Distance Contracts under Law No. 6502 on Consumer Protection, 'contracts for services performed instantly in electronic media or non-physical goods delivered instantly to the consumer' are subject to exceptions from the right of withdrawal. Since deposited balances and purchased virtual numbers are made available instantly, no cash refund under the right of withdrawal can be claimed."
      },
      {
        title: "5. Abuse and Security Block Rules",
        body: "In case of manipulative transactions exploiting server vulnerabilities, system sabotage through faulty or spam API requests, or use of stolen cards and illegal payment methods, OnayTR reserves the right to suspend the User's account and freeze their remaining balance indefinitely. Such suspicious financial activities will be reported to legal and financial authorities."
      }
    ]
  };

  const contentAz = {
    title: "Geri Qaytarma Şərtləri",
    subtitle: "OnayTR balans artırma, əməliyyatların ləğvi və geri qaytarma qaydaları.",
    updated: "Son Yenilənmə: 12 İyul 2026",
    sections: [
      {
        title: "1. Balans Artırma Şərtləri",
        body: "OnayTR platforması vasitəsilə virtual nömrələr almaq və ya icarəyə götürmək üçün PayTR, Shopier və ya Oxapay zəmanəti ilə kredit kartı, debet kartı, bank köçürməsi və ya kriptovalyuta ilə balansınızı artıra bilərsiniz. Yüklənən məbləğlər dərhal təsdiqlənir və avtomatik olaraq OnayTR hesabınıza balans kimi yazılır. İstifadəçi cari balansını istədiyi an istifadəçi panelindən və ya API sorğusu vasitəsilə görə bilər."
      },
      {
        title: "2. 100% SMS Geri Qaytarma Zəmanəti",
        body: "Satın aldığınız birdəfəlik virtual nömrəyə 10-20 dəqiqə ərzində (və ya kirayə nömrələrdə icarə müddəti başlamazdan əvvəl) hədəf platformadan SMS gəlmədikdə, sistem əməliyyatı avtomatik və ya mexaniki olaraq ləğv edir. Ləğv edilmiş əməliyyatların məbləği heç bir komissiya olmadan anında və tam olaraq OnayTR balansınıza geri qaytarılır. SMS kodu gəlməyən nömrəyə görə ödəniş tutulmur və heç bir maliyyə itkisi baş vermir."
      },
      {
        title: "3. Nəğd Geri Qaytarma Siyasəti və Məhdudiyyətlər",
        body: "Virtual SMS təsdiq xidmətlərinin rəqəmsal və dərhal icra edilən xüsusiyyəti gərəyi, OnayTR hesabına yüklənən və qismən və ya tamamilə istifadə olunan balansın bank kartına və ya bank hesabına nəğd pul şəklində geri qaytarılması mümkün deyil. Yüklənən bütün balanslar yalnız OnayTR daxilində nömrə almaq və ya kirayələmək üçün istifadə edilə bilər. Balans digər istifadəçilərə köçürülə və ya verilə bilməz."
      },
      {
        title: "4. İmtina Hüququ İstisnası",
        body: "İstehlakçıların Hüquqlarının Qorunması haqqında müvafiq qanunvericiliyinə əsasən, 'elektron mühitdə dərhal icra edilən xidmətlər və ya istehlakçıya dərhal çatdırılan qeyri-maddi mallara dair müqavilələr' imtina hüququnun istisnalarına daxildir. Balans və satın alınan virtual nömrələr dərhal istifadəyə təqdim olunduğu üçün nəğd geri qaytarma tələb edilə bilməz."
      },
      {
        title: "5. Kötüye İstifadə və Təhlükəsizlik Blok Qaydaları",
        body: "İstifadəçilər tərəfindən sistem boşluqlarından istifadə edərək manipulyativ əməliyyatlar aparıldıqda, səhv və ya spam API sorğuları ilə sistemin fəaliyyətinə mane olduqda, oğurlanmış kartlar və ya qanunsuz ödəniş üsullarından istifadə edildikdə, OnayTR istifadəçinin hesabını dayandırmaq və balansını müddətsiz bloklamaq hüququnu özündə saxlayır. Belə şübhəli maliyyə əməliyyatları səlahiyyətli dövlət orqanlarına bildiriləcəkdir."
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
            <CreditCard className="h-6 w-6 text-white" />
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
              <p className="text-slate-650 dark:text-slate-400 text-sm leading-relaxed font-semibold font-sans">
                {section.body}
              </p>
            </section>
          ))}

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-bold">
            <span>{currentContent.updated}</span>
            <div className="flex items-center gap-2 text-slate-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>{language === 'tr' ? '%100 Güvenli PayTR ve Shopier Ödeme Alt Yapısı' : language === 'az' ? '100% Təhlükəsiz PayTR və Shopier Ödəniş Sistemi' : '100% Secure Payment Integrations'}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
