"use client";

import { useLanguage } from '@/components/LanguageProvider';
import { FileText, ShieldAlert, Award } from 'lucide-react';

export default function TermsPage() {
  const { language } = useLanguage();

  const contentTr = {
    title: "Kullanım Sözleşmesi",
    subtitle: "OnayTR platformunun genel kullanım şartları ve kuralları.",
    updated: "Son Güncelleme: 12 Temmuz 2026",
    sections: [
      {
        title: "1. Taraflar ve Tanımlar",
        body: "İşbu Kullanım Sözleşmesi, İngiltere'de kayıtlı olan Webmetri Digital Solutions Ltd (bundan böyle 'OnayTR' veya 'Şirket' olarak anılacaktır) ile platforma (onaytr.com) üye olan ve sunulan sanal numara tahsis etme ve SMS doğrulama/kiralama servislerini kullanan kişi (bundan böyle 'Kullanıcı' veya 'Üye' olarak anılacaktır) arasında akdedilmiştir. Sisteme üye olan veya servisleri kullanan her birey bu şartları tamamen kabul etmiş sayılır."
      },
      {
        title: "2. Hizmetin Sunumu ve Kapsamı",
        body: "OnayTR, Kullanıcı'ya üçüncü taraf dijital platformlarda üyelik veya doğrulama işlemlerini gerçekleştirebilmesi amacıyla tek kullanımlık veya belirli süreyle kiralık sanal numaralar sağlar. Bu numaralar tamamen geçici olup, fiziksel bir SIM kart teslimi yapılmaz. Sağlanan numaralara gelen SMS kodları, OnayTR paneli veya API entegrasyonu üzerinden Kullanıcı'ya gösterilir."
      },
      {
        title: "3. Kullanıcı Beyan ve Taahhütleri",
        body: "Kullanıcı, kayıt olurken ve profilini doldururken doğru, güncel ve eksiksiz bilgi (aktif e-posta adresi) sağlamakla yükümlüdür. Kullanıcı, hesabının şifresini ve API erişim anahtarını (API Key) gizli tutmakla sorumludur. Hesap veya API üzerinden yapılan tüm işlemlerin yasal sorumluluğu doğrudan Kullanıcı'ya aittir. Kullanıcı en az 18 yaşında olduğunu veya yasal olarak bu sözleşmeyi akdetme ehliyetine sahip olduğunu beyan eder."
      },
      {
        title: "4. Kullanım Kısıtlamaları ve Yasaklar",
        body: "Sanal numaralar yasa dışı faaliyetlerde, terör örgütü propagandalarında, dolandırıcılık veya spam SMS gönderme işlemlerinde, resmi/devlet kurumlarının (savcılık, mahkeme, polis, kamu bankaları vb.) doğrulama sistemlerini manipüle etmede kullanılamaz. BTK veya uluslararası telekomünikasyon otoritelerinin belirlediği yasal kurallara aykırı eylemlerde bulunmak yasaktır. Aykırı kullanım tespiti halinde üyelik derhal askıya alınır ve yasal mercilerle iş birliği yapılır."
      },
      {
        title: "5. API ve Otomasyon Kullanımı",
        body: "Kullanıcı, sağlanan API'yi otomasyonlarında, yazılımlarında veya botlarında kullanabilir. Ancak API üzerinden aşırı veya sunucu güvenliğini/performansını tehdit eden sıklıkta (DDoS vb.) istek atmak yasaktır. API anahtarının yetkisiz kullanımı durumunda sorumluluk Kullanıcı'ya aittir. OnayTR, teknik nedenlerle API uç noktalarını değiştirme veya geçici olarak askıya alma hakkını saklı tutar."
      },
      {
        title: "6. Üçüncü Taraf Uygulamalar ve Sorumluluk Sınırı (Disclaimer)",
        body: "OnayTR, numaraların tahsis edildiği üçüncü taraf uygulamaların (örn. WhatsApp, Telegram, Google, Instagram vb.) kendi kullanım koşullarını, algoritmalarını veya güvenlik politikalarını güncellemesi sonucu numaraların veya bu numaralarla açılan hesapların engellenmesi, kapatılması durumunda hiçbir sorumluluk kabul etmez. OnayTR sadece doğrulama kodunun (SMS) kendi paneline başarıyla ulaştırılmasını garanti eder."
      },
      {
        title: "7. Ödeme, Bakiye ve Fiyatlandırma",
        body: "Platform üzerindeki servis fiyatları, operatör ve ülke yoğunluğuna, VIP seviyesine (VIP tiers) göre değişkenlik gösterebilir. Kullanıcı, PayTR, Shopier veya Oxapay ödeme yöntemleriyle hesabına bakiye yükleyebilir. Fiyatlar ve stok durumları anlıktır. VIP seviyelerine uygulanan indirimler sistem tarafından otomatik hesaplanır. API veya manuel alımların tamamı güncel bakiye üzerinden tahsil edilir."
      },
      {
        title: "8. Fikri Mülkiyet Hakları",
        body: "OnayTR web sitesi, mobil uygulaması, yazılım kodları, API dokümantasyonu, logoları, tasarımları ve markası üzerindeki tüm haklar Webmetri Digital Solutions Ltd'ye aittir. Kullanıcının sistem üzerinde tersine mühendislik yapması, kaynak kodlarını kopyalaması veya izinsiz olarak marka görsel/materyallerini kullanması yasaktır."
      },
      {
        title: "9. Sözleşme Değişiklikleri ve Fesih",
        body: "OnayTR, işbu sözleşme koşullarını herhangi bir zamanda, tek taraflı olarak güncelleme veya değiştirme hakkını saklı tutar. Güncellenmiş sözleşme, web sitesinde yayınlandığı andan itibaren tüm kullanıcılar için geçerli olur. Kullanıcının yasal kuralları ihlal etmesi halinde, OnayTR üyenin hesabını bildirim yapmaksızın tek taraflı feshedebilir ve bakiyesini dondurabilir."
      },
      {
        title: "10. Uyuşmazlıkların Çözümü ve Yetkili Mahkeme",
        body: "İşbu sözleşmeden doğacak her türlü uyuşmazlığın çözümünde Birleşik Krallık (Londra) yasaları ve mahkemeleri yetkilidir. Türkiye veya Azerbaycan'da ikamet eden kullanıcılar için yerel tüketici yasalarının emredici hükümleri saklı kalmak kaydıyla, yetkili adli merciler Londra Mahkemeleri ve İcra Daireleridir."
      }
    ]
  };

  const contentEn = {
    title: "Terms of Service",
    subtitle: "General terms of use and regulations for OnayTR platform.",
    updated: "Last Updated: July 12, 2026",
    sections: [
      {
        title: "1. Parties and Definitions",
        body: "This Terms of Service Agreement is entered into by and between Webmetri Digital Solutions Ltd (registered in the United Kingdom, hereinafter 'OnayTR' or 'Company'), which operates the platform (onaytr.com), and the person (hereinafter 'User' or 'Member') who registers on the platform and uses the virtual number allocation and SMS verification/rental services. Any individual registering on the platform or using the services is deemed to have accepted these terms in full."
      },
      {
        title: "2. Provision and Scope of Service",
        body: "OnayTR provides temporary or rented virtual phone numbers to the User for the purpose of receiving verification SMS codes on third-party digital platforms. These numbers are temporary, and no physical SIM card is delivered. SMS codes received on these numbers are displayed to the User via the OnayTR dashboard or API integration."
      },
      {
        title: "3. User Declarations and Obligations",
        body: "The User is obligated to provide accurate, current, and complete information (active email address) during registration. The User is responsible for maintaining the confidentiality of their password and API access key (API Key). The User is solely liable for all activities under their account or API. The User declares that they are at least 18 years old or legally competent to enter into this agreement."
      },
      {
        title: "4. Use Restrictions and Prohibitions",
        body: "Virtual numbers shall not under any circumstances be used for illegal activities, terrorist propaganda, fraudulent schemes, sending spam SMS, or manipulating the verification systems of official/governmental bodies (prosecutors, courts, police, public banks, etc.). Actions contrary to local telecommunications regulations or international laws are strictly prohibited. In case of violation, the account will be immediately suspended, and we will cooperate with legal authorities."
      },
      {
        title: "5. API and Automation Usage",
        body: "The User may integrate the provided API into their automations, software, or bots. However, it is forbidden to send requests at an excessive rate that threatens server security or performance (e.g., DDoS). The User is responsible for unauthorized use of their API key. OnayTR reserves the right to modify API endpoints or temporarily suspend them for technical reasons."
      },
      {
        title: "6. Third-Party Applications and Limitation of Liability (Disclaimer)",
        body: "OnayTR accepts no liability if accounts created using the virtual numbers are suspended, blocked, or closed due to updates in safety algorithms or policy updates of third-party platforms (e.g. WhatsApp, Telegram, Google, Instagram). OnayTR only guarantees the successful delivery of the SMS verification code to its own panel."
      },
      {
        title: "7. Payment, Balance, and Pricing",
        body: "Service prices on the platform vary depending on operator/country load and the User's VIP level. The User can deposit balance using PayTR, Shopier, or Oxapay payment systems. Prices and stock numbers are real-time. VIP discounts are automatically calculated. All manual or API purchases are deducted from the user's current balance."
      },
      {
        title: "8. Intellectual Property Rights",
        body: "All intellectual property rights of the OnayTR website, app, software, API docs, logos, designs, and brand belong to Webmetri Digital Solutions Ltd. Reverse engineering, copying source code, or unauthorized use of brand assets is strictly prohibited."
      },
      {
        title: "9. Amendments and Termination",
        body: "OnayTR reserves the right to unilaterally update or change these terms at any time. The updated agreement becomes effective for all users upon publication. OnayTR may terminate the User's account and freeze their balance without notice if they violate these terms."
      },
      {
        title: "10. Governing Law and Jurisdiction",
        body: "Any disputes arising out of this agreement shall be governed by and construed in accordance with the laws of the United Kingdom (England & Wales). Without prejudice to mandatory consumer protection laws in Turkey or Azerbaijan, London Courts and Enforcement Offices shall have exclusive jurisdiction."
      }
    ]
  };

  const contentAz = {
    title: "İstifadə Şərtləri",
    subtitle: "OnayTR platformasının ümumi istifadə şərtləri və qaydaları.",
    updated: "Son Yenilənmə: 12 İyul 2026",
    sections: [
      {
        title: "1. Tərəflər və Təriflər",
        body: "Bu İstifadə Şərtləri Müqaviləsi, Böyük Britaniyada qeydiyyatdan keçmiş Webmetri Digital Solutions Ltd (bundan sonra 'OnayTR' və ya 'Şirkət' adlandırılacaq) ilə platformada (onaytr.com) qeydiyyatdan keçən və virtual nömrə təyini və SMS təsdiqləmə/icarə xidmətlərindən istifadə edən şəxs (bundan sonra 'İstifadəçi' və ya 'Üzv' adlandırılacaq) arasında bağlanmışdır. Qeydiyyatdan keçən və ya xidmətlərdən istifadə edən hər kəs bu şərtləri tamamilə qəbul etmiş sayılır."
      },
      {
        title: "2. Xidmətin Təqdimatı və Həcmi",
        body: "OnayTR, İstifadəçiyə üçüncü tərəf rəqəmsal platformalarda qeydiyyat və ya doğrulama əməliyyatlarını apara bilməsi üçün birdəfəlik və ya müəyyən müddətə kirayəlik virtual nömrələr təqdim edir. Bu nömrələr müvəqqətidir və fiziki SIM kart çatdırılmır. Alınan SMS kodları OnayTR paneli və ya API vasitəsilə İstifadəçiyə göstərilir."
      },
      {
        title: "3. İstifadəçinin Bəyannaməsi və Öhdəlikləri",
        body: "İstifadəçi qeydiyyatdan keçərkən doğru, cari və tam məlumat (aktiv e-poçt ünvanı) təqdim etməyə borcludur. İstifadəçi hesab şifrəsinin və API giriş açarının (API Key) məxfiliyini qorumağa cavabdehdir. Hesab və ya API üzərindən edilən bütün əməliyyatların hüquqi məsuliyyəti birbaşa İstifadəçiyə aiddir. İstifadəçi ən azı 18 yaşında olduğunu və ya bu müqaviləni imzalamaq hüququna sahib olduğunu bəyan edir."
      },
      {
        title: "4. İstifadə Məhdudiyyətləri və Qadağalar",
        body: "Virtual nömrələr qanunsuz fəaliyyətlərdə, terror təbliğatında, dələduzluqda, spam göndərilməsində və ya dövlət orqanlarının (məhkəmə, polis, dövlət bankları və s.) təsdiq sistemlərinin manipulyasiyasında istifadə edilə bilməz. Qaydanın pozulması hesabın dərhal dayandırılmasına səbəb olacaq və hüquq-mühafizə orqanları ilə əməkdaşlıq ediləcək."
      },
      {
        title: "5. API və Avtomatlaşdırma İstifadəsi",
        body: "İstifadəçi təqdim edilən API-dən avtomatlaşdırmalarında, proqramlarında və ya botlarında istifadə edə bilər. Lakin API üzərindən server təhlükəsizliyini və ya işini təhlükəyə atan həddindən artıq tezlikdə (DDoS və s.) sorğu göndərmək qadağandır. API açarının icazəsiz istifadəsinə görə məsuliyyət İstifadəçiyə aiddir. OnayTR API uç nöqtələrini dəyişdirmək hüququnu saxlayır."
      },
      {
        title: "6. Üçüncü Tərəf Tətbiqləri və Məsuliyyətin Məhdudlaşdırılması (Disclaimer)",
        body: "OnayTR, nömrələrin təyin edildiyi tətbiqlərin (məs. WhatsApp, Telegram, Google, Instagram) öz təhlükəsizlik alqoritmlərini və ya istifadə şərtlərini yeniləməsi səbəbindən nömrələrin və ya bu nömrələrlə yaradılan hesabların bağlanması halında heç bir məsuliyyət daşımır. OnayTR yalnız doğrulama kodunun platformasına çatdırılmasına zəmanət verir."
      },
      {
        title: "7. Ödəniş, Balans və Qiymətləndirmə",
        body: "Platformadakı xidmət qiymətləri operator/ölkə sıxlığından və İstifadəçinin VIP səviyyəsindən asılı olaraq dəyişə bilər. İstifadəçi PayTR, Shopier və ya Oxapay sistemləri vasitəsilə balansını artıra bilər. Qiymətlər və stok məlumatları anlıqdır. VIP endirimləri sistem tərəfindən avtomatik hesablanır. API və ya mexaniki satınalmalar cari balansdan çıxılır."
      },
      {
        title: "8. Əqli Mülkiyyət Hüquqları",
        body: "OnayTR veb saytının, tətbiqinin, API sənədlərinin, loqolarının, dizaynlarının və markasının bütün əqli mülkiyyət hüquqları Webmetri Digital Solutions Ltd şirkətinə məxsusdur. Sistemdə tərs mühəndislik etmək və ya mənbə kodunu kopyalamaq qadağandır."
      },
      {
        title: "9. Müqavilədə Dəyişikliklər və Xitam",
        body: "OnayTR bu şərtləri istənilən vaxt birtərəfli qaydada yeniləmək hüququnu saxlayır. Yenilənmiş şərtlər saytda dərc edildiyi andan etibarlıdır. İstifadəçi qaydaları pozduqda, OnayTR xəbərdarlıq etmədən istifadəçinin hesabına xitam verə və balansını dondura bilər."
      },
      {
        title: "10. Mübahisələrin Həlli və Səlahiyyətli Məhkəmə",
        body: "Bu müqavilədən irəli gələn mübahisələrin həllində Böyük Britaniya (London) qanunvericiliyi və məhkəmələri səlahiyyətlidir. Yerli istehlakçı qanunlarının məcburi müddəaları saxlanılmaqla, mübahisələr London Məhkəmələri tərəfindən həll edilir."
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
            <FileText className="h-6 w-6 text-white" />
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
              <p className="text-slate-650 dark:text-slate-400 text-sm leading-relaxed font-semibold">
                {section.body}
              </p>
            </section>
          ))}

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-bold">
            <span>{currentContent.updated}</span>
            <div className="flex items-center gap-2 text-slate-500">
              <ShieldAlert className="h-4 w-4 text-[#4648d4]" />
              <span>{language === 'tr' ? 'Güvenli Çevre ve Şifreli Bağlantı' : language === 'az' ? 'Təhlükəsiz Mühit və Şifrəli Bağlantı' : 'Secure Environment & Encryption'}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
