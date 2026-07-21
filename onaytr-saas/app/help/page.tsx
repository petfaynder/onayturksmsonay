"use client";

import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, LifeBuoy, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { t, language } = useLanguage();

  const faqs = [
    {
      q: "Sanal numara (SMS onay) sistemi nasıl çalışır?",
      a: "Ana sayfamızdan veya panelinizden istediğiniz uygulamayı (WhatsApp, Telegram vb.) ve ülkeyi seçip 'Numara Al' butonuna bastığınızda, sistem size geçici bir numara tanımlar. Numarayı ilgili uygulamaya yazıp gelen kodu panelimizden görebilirsiniz."
    },
    {
      q: "SMS kodu gelmezse ne olur? İade alabilir miyim?",
      a: "Evet! OnayTR olarak %100 iade garantisi sunuyoruz. Satın aldığınız numaraya 10 dakika içerisinde SMS gelmezse sistem otomatik olarak işlemi iptal eder ve ödediğiniz tutarı bakiyenize iade eder. Hiçbir kaybınız olmaz."
    },
    {
      q: "Kiralık numara (Rent) özelliğinin farkı nedir?",
      a: "Tek kullanımlık numaralar sadece bir adet SMS almanıza izin verir ve işlem bittiğinde kapanır. Kiralık numaralar ise kiraladığınız süre boyunca (örneğin 4 saat, 24 saat veya 1 hafta) dilediğiniz kadar SMS almanızı sağlar. Sürekli doğrulama gereken hesaplar için idealdir."
    },
    {
      q: "Kredi kartı ile bakiye yükleyebilir miyim?",
      a: "Evet, PayTR ve Shopier entegrasyonlarımız sayesinde 3D secure güvencesiyle tüm kredi kartı, banka kartı ve banka havalesi ile bakiye yükebilirsiniz. Yüklemeleriniz anında hesabınıza yansır."
    },
    {
      q: "Kripto para ile bakiye yükleme seçeneğiniz var mı?",
      a: "Evet, Oxapay kripto ödeme altyapımız ile komisyonsuz olarak USDT, TRX, BTC gibi popüler kripto para birimleriyle bakiye yükleyebilirsiniz."
    },
    {
      q: "Geliştiriciler için API desteğiniz var mı?",
      a: "Evet, bayiler ve kendi yazılımlarını kullanan geliştiriciler için API anahtarı desteğimiz bulunmaktadır. Profil sayfanızdan API anahtarınızı alıp entegrasyonu tamamlayabilirsiniz."
    }
  ];

  const getFaqs = () => {
    if (language === 'az') {
      return [
        {
          q: "Virtual nömrə (SMS təsdiq) sistemi necə işləyir?",
          a: "Ana səhifəmizdən və ya panelinizdən istədiyiniz tətbiqi (WhatsApp, Telegram və s.) və ölkəni seçib 'Nömrə Al' düyməsinə basdıqda, sistem sizə müvəqqəti nömrə təyin edir. Bu nömrəni müvafiq tətbiqə yazaraq gələn kodu panelimizdən görə bilərsiniz."
        },
        {
          q: "SMS kodu gəlməsə nə olar? Geri ödəniş ala bilərəmmi?",
          a: "Bəli! OnayTR olaraq 100% geri ödəniş zəmanəti təklif edirik. Satın aldığınız nömrəyə 10 dəqiqə ərzində SMS gəlməsə, sistem avtomatik olaraq əməliyyatı ləğv edir və ödədiyiniz məbləği balansınıza qaytarır. Heç bir itkiniz olmur."
        },
        {
          q: "Kirayə nömrə (Rent) xüsusiyyətinin fərqi nədir?",
          a: "Birdəfəlik istifadə nömrələri yalnız bir SMS almağa imkan verir və əməliyyat başa çatdıqda bağlanır. Kirayə nömrələr isə kirayələdiyiniz müddət ərzində (məsələn, 4 saat, 24 saat və ya 1 həftə) istədiyiniz qədər SMS almağa imkan verir. Daimi təsdiqləmə tələb edən hesablar üçün idealdır."
        },
        {
          q: "Kredit kartı ile balans artıra bilərəmmi?",
          a: "Bəli, PayTR və Shopier inteqrasiyalarımız sayəsində 3D secure təhlükəsizliyi ilə bütün kredit kartı, debet kartı və bank köçürməsi vasitəsilə balans artıra bilərsiniz. Yükləmələriniz dərhal hesabınıza əks olunur."
        },
        {
          q: "Kripto valyuta ilə balans artırma seçiminiz varmı?",
          a: "Bəli, Oxapay kripto ödəniş infrastrukturumuzla heç bir komissiya olmadan USDT, TRX, BTC gibi populyar kripto valyutalarla balans artıra bilərsiniz."
        },
        {
          q: "Geliştiricilər üçün API dəstəyiniz varmı?",
          a: "Bəli, dilerlər və öz proqram təminatlarından istifadə edən tərtibatçılar üçün API açarı dəstəyimiz mövcuddur. Profil səhifənizdən API açarınızı alıb inteqrasiyanı tamamlaya bilərsiniz."
        }
      ];
    } else if (language === 'en') {
      return [
        {
          q: "How does the virtual number (SMS confirmation) system work?",
          a: "When you select the application (WhatsApp, Telegram, etc.) and country from our homepage or dashboard and click 'Get Number', the system assigns a temporary number to you. Enter this number into the application and check the SMS code from our dashboard."
        },
        {
          q: "What if the SMS code does not arrive? Can I get a refund?",
          a: "Yes! We offer a 100% refund guarantee at OnayTR. If no SMS arrives to your purchased number within 10 minutes, the system automatically cancels the transaction and refunds the paid amount to your balance instantly. You take no risk."
        },
        {
          q: "What is the difference of the rented number (Rent) feature?",
          a: "Standard SMS confirmation numbers are single-use and close once the code is received. Rented numbers, however, allow you to receive as many SMS codes as you want during the rented period (e.g. 4 hours, 24 hours, or 1 week). Ideal for accounts requiring continuous verification."
        },
        {
          q: "Can I deposit balance using a credit card?",
          a: "Yes, thanks to our PayTR and Shopier integrations, you can securely top up using credit cards, debit cards, or bank transfer with 3D secure. Deposits are instantly credited to your account."
        },
        {
          q: "Do you have a cryptocurrency deposit option?",
          a: "Yes, with our Oxapay crypto payment infrastructure, you can deposit using popular cryptocurrencies like USDT, TRX, and BTC with zero commission."
        },
        {
          q: "Do you support API for developers?",
          a: "Yes, we support API keys for resellers and developers using their custom software. You can obtain your API key from the developer page and complete the integration."
        }
      ];
    }
    return faqs;
  };

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const currentFaqs = getFaqs();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 space-y-8 text-left relative overflow-hidden">
      
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#712ae2]/5 rounded-full blur-[100px] -z-10 animate-float"></div>

      <div className="flex flex-col items-center text-center">
        <div className="h-16 w-16 bg-[#4648d4]/10 dark:bg-[#4648d4]/20 rounded-2xl flex items-center justify-center text-[#4648d4] mb-4 border border-[#4648d4]/20 shadow-sm transform -rotate-3">
          <HelpCircle className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-black text-slate-800 dark:text-white display-font mb-2">
          {language === 'tr' ? 'Sıkça Sorulan Sorular' : language === 'az' ? 'Tez-tez Verilən Suallar' : 'Frequently Asked Questions'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md">
          {language === 'tr' ? 'OnayTR kullanımı ve kuralları hakkında bilmek istediğiniz her şey.' : language === 'az' ? 'OnayTR istifadəsi və qaydaları haqqında bilmək istədiyiniz hər şey.' : 'Everything you want to know about using OnayTR and its rules.'}
        </p>
      </div>

      <div className="space-y-4">
        {currentFaqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div key={idx} className="glass-premium overflow-hidden rounded-2xl shadow-sm transition-all">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 flex items-center justify-between text-left font-bold text-slate-850 dark:text-slate-200 text-[15px]"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp className="h-5 w-5 text-[#4648d4] shrink-0" /> : <ChevronDown className="h-5 w-5 text-slate-400 dark:text-slate-500 shrink-0" />}
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

      {/* Still need help CTA */}
      <div className="glass-premium p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 mt-12 bg-gradient-to-r from-[#4648d4]/5 to-transparent shadow-sm">
        <div className="flex items-center gap-3 text-left">
          <div className="h-12 w-12 rounded-xl bg-[#4648d4]/10 text-[#4648d4] flex items-center justify-center shrink-0">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-black text-slate-850 dark:text-white text-base display-font">
              {language === 'tr' ? 'Aradığınız yanıtı bulamadınız mı?' : language === 'az' ? 'Axtardığınız cavabı tapa bilmədiniz?' : 'Couldn\'t find the answer you were looking for?'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-0.5">
              {language === 'tr' ? 'Destek ekibimiz 7/24 sorularınızı yanıtlamak için hazır.' : language === 'az' ? 'Dəstək komandamız 7/24 suallarınızı cavablandırmağa hazırdır.' : 'Our support team is ready to answer your questions 24/7.'}
            </p>
          </div>
        </div>
        <Link
          href="/contact"
          className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm py-2.5 px-6 rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          {language === 'tr' ? 'Bize Ulaşın' : language === 'az' ? 'Bizimlə Əlaqə' : 'Contact Us'}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
