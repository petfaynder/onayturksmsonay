"use client";

import { useLanguage } from '@/components/LanguageProvider';
import { ShieldCheck, Cpu, Database, CheckCircle, Award, Users } from 'lucide-react';

export default function AboutPage() {
  const { language } = useLanguage();

  const stats = [
    { value: "500K+", labelTr: "Başarılı SMS Onay", labelEn: "Successful SMS Verifications", labelAz: "Uğurlu SMS Təsdiqi" },
    { value: "100+", labelTr: "Global Operatör Bağlantısı", labelEn: "Global Operators Connected", labelAz: "Qlobal Operator Bağlantısı" },
    { value: "0.8s", labelTr: "Ortalama SMS İletim Hızı", labelEn: "Avg SMS Delivery Speed", labelAz: "Ortalama SMS Çatdırılma Sürəti" },
    { value: "99.9%", labelTr: "Sistem Aktiflik Oranı (SLA)", labelEn: "System Uptime SLA", labelAz: "Sistem Aktivlik Nisbəti (SLA)" }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FF] dark:bg-[#0D1117] pt-28 pb-16 text-left relative overflow-hidden">
      
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4648d4]/5 dark:bg-[#4648d4]/2 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#712ae2]/5 dark:bg-[#712ae2]/2 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute inset-0 micro-grid opacity-75 -z-20"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4648d4]/10 dark:bg-[#4648d4]/20 border border-[#4648d4]/20 mb-4">
            <Award className="h-4 w-4 text-[#4648d4]" />
            <span className="text-[10px] font-black text-[#4648d4] uppercase tracking-wider">
              {language === 'tr' ? 'Biz Kimiz?' : language === 'az' ? 'Biz Kimik?' : 'Who We Are'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white display-font mb-4">
            {language === 'tr' ? 'Hakkımızda' : language === 'az' ? 'Haqqımızda' : 'About Us'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {language === 'tr'
              ? 'OnayTR, kullanıcıların dijital platformlarda kişisel bilgilerini koruyarak güvenle onay almalarını sağlayan yeni nesil bir telekomünikasyon altyapısıdır.'
              : language === 'az'
              ? 'OnayTR, istifadəçilərin rəqəmsal platformalarda şəxsi məlumatlarını qoruyaraq etibarlı şəkildə təsdiqləmə almalarını təmin edən yeni nəsil telekommunikasiya infrastrukturudur.'
              : 'OnayTR is a next-generation telecommunication infrastructure that enables users to securely verify accounts on digital platforms while protecting personal data.'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, idx) => (
            <div key={idx} className="glass-premium p-6 rounded-2xl shadow-sm text-center">
              <span className="text-3xl md:text-4xl font-black text-[#4648d4] dark:text-[#4648d4] display-font block mb-1">{stat.value}</span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-450 leading-relaxed block">
                {language === 'az' ? stat.labelAz : language === 'en' ? stat.labelEn : stat.labelTr}
              </span>
            </div>
          ))}
        </div>

        {/* Detailed Info Blocks */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          
          <div className="glass-premium p-8 rounded-3xl shadow-sm space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-[#4648d4]/10 text-[#4648d4] flex items-center justify-center">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white display-font">
              {language === 'tr' ? 'Akıllı Yönlendirme Altyapısı' : language === 'az' ? 'Ağıllı Marşrutlaşdırma Altyapısı' : 'Smart Routing Engine'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
              {language === 'tr'
                ? 'Geliştirdiğimiz özel yönlendirme motoru, SMS talebinizi en yakın ve en müsait hücresel baz istasyonu hattına saniyeler içinde ileterek yüksek başarı oranını garantiler.'
                : language === 'az'
                ? 'İnkişaf etdirdiyimiz xüsusi marşrutlaşdırma mühərriki, SMS sorğunuzu saniyələr içində ən yaxın və ən uyğun hüceyrəvi baza stansiyası xəttinə ötürərək yüksək uğur dərəcəsinə zəmanət verir.'
                : 'Our custom routing engine delivers your SMS request to the nearest and most available cellular base station line within seconds, guaranteeing high verification success rates.'}
            </p>
          </div>

          <div className="glass-premium p-8 rounded-3xl shadow-sm space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-[#712ae2]/10 text-[#712ae2] flex items-center justify-center">
              <Database className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white display-font">
              {language === 'tr' ? 'Fiziksel SIM Kart Kalitesi' : language === 'az' ? 'Fiziki SIM Kart Keyfiyyəti' : 'Physical SIM Network'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
              {language === 'tr'
                ? 'Sanal VoIP numaraları yerine, anlaşmalı olduğumuz global operatörler üzerinden gerçek fiziksel SIM kart hatları kullanıyoruz. Böylece numaralar platformlar tarafından engellenmez.'
                : language === 'az'
                ? 'Virtual VoIP nömrələri yerinə, müqaviləmiz olan qlobal operatorlar vasitəsilə real fiziki SIM kart xətlərindən istifadə edirik. Beləliklə, nömrələr platformalar tərəfindən bloklanmır.'
                : 'Instead of virtual VoIP numbers, we utilize real physical SIM lines through contracted global operators. This prevents numbers from being flagged or blocked by service providers.'}
            </p>
          </div>

          <div className="glass-premium p-8 rounded-3xl shadow-sm space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100/50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white display-font">
              {language === 'tr' ? 'KVKK Uyumlu Gizlilik' : language === 'az' ? 'KVKK Uyğun Gizlilik' : 'Data Privacy (GDPR/KVKK)'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
              {language === 'tr'
                ? 'İşlem tamamlandıktan sonra kullanılan sanal numara ile ilgili tüm mesaj verileri ve log kayıtları kalıcı olarak sistemlerimizden silinir. Bilgileriniz asla saklanmaz.'
                : language === 'az'
                ? 'Əməliyyat başa çatdıqdan sonra istifadə olunan virtual nömrə ilə bağlı bütün mesaj məlumatları və log qeydləri sistemimizdən həmişəlik silinir. Məlumatlarınız heç vaxt saxlanılmır.'
                : 'After your verification is complete, all incoming text messages, code values, and transaction logs are permanently purged from our database. Your personal info is never kept.'}
            </p>
          </div>

        </div>

        {/* Our Vision */}
        <div className="glass-premium p-8 md:p-12 rounded-3xl shadow-sm text-left">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white display-font mb-4 flex items-center gap-3">
            <Users className="h-6 w-6 text-[#4648d4]" />
            {language === 'tr' ? 'Vizyonumuz & Değerlerimiz' : language === 'az' ? 'Vizyonumuz və Dəyərlərimiz' : 'Our Vision & Values'}
          </h2>
          <div className="space-y-4 text-slate-600 dark:text-slate-400 text-xs font-semibold leading-relaxed">
            <p>
              {language === 'tr'
                ? 'Teknoloji dünyasının hızla büyüdüğü ve veri güvenliğinin her zamankinden daha kritik hale geldiği günümüzde, kullanıcılarımızın kişisel gizliliğini korumak en temel önceliğimizdir. OnayTR olarak, dijital platformlardaki kimlik doğrulama süreçlerini en sade, en hızlı ve en güvenli hale getirmek için yenilikçi teknolojiler üretiyoruz.'
                : language === 'az'
                ? 'Rəqəmsal dünyanın sürətlə böyüdüyü və məlumat təhlükəsizliyinin hər zamankindən daha vacib olduğu günümüzdə, istifadəçilərimizin şəxsi məxfiliyini qorumaq ən əsas hədəfimizdir. OnayTR olaraq, platformalarda şəxsiyyət təsdiqləmə proseslərini ən sadə, ən sürətli və ən təhlükəsiz etmək üçün innovativ həllər yaradırıq.'
                : 'In today\'s rapidly evolving digital world where data privacy has become more critical than ever, protecting our users\' personal privacy is our topmost priority. At OnayTR, we produce innovative technologies to make authentication processes on digital platforms simple, lightning-fast, and completely secure.'}
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-4">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-350">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{language === 'tr' ? 'Kesintisiz 7/24 Teknik Destek' : language === 'az' ? 'Fasiləsiz 7/24 Texniki Dəstək' : 'Seamless 24/7 Technical Support'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-350">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{language === 'tr' ? '%100 Başarı veya Anında İade' : language === 'az' ? '100% Uğur və ya Anında Geri Qaytarma' : '100% Success or Instant Refund'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-350">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{language === 'tr' ? 'Tam Otomatik API Entegrasyonu' : language === 'az' ? 'Tam Avtomatlaşdırılmış API İnteqrasiyası' : 'Fully Automated API Integration'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-350">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{language === 'tr' ? 'Güvenilir Global Operatör Hatları' : language === 'az' ? 'Etibarlı Qlobal Operator Xətləri' : 'Reliable Global Operator Lines'}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
