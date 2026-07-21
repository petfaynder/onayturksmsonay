"use client";

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { Mail, Clock, MessageSquare, Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import TurnstileWidget from '@/components/TurnstileWidget';

export default function ContactPage() {
  const { language } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, turnstileToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || (language === 'tr' ? 'Bir hata oluştu.' : language === 'az' ? 'Bir xəta baş verdi.' : 'An error occurred.'));
        setIsLoading(false);
      } else {
        setIsSent(true);
        setIsLoading(false);
      }
    } catch {
      setError(language === 'tr' ? 'Bağlantı hatası.' : language === 'az' ? 'Bağlantı xətası.' : 'Connection error.');
      setIsLoading(false);
    }
  };

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
            <MessageSquare className="h-4 w-4 text-[#4648d4]" />
            <span className="text-[10px] font-black text-[#4648d4] uppercase tracking-wider">
              {language === 'tr' ? 'Bize Ulaşın' : language === 'az' ? 'Bizimlə Əlaqə' : 'Get In Touch'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white display-font mb-4">
            {language === 'tr' ? 'İletişim' : language === 'az' ? 'Əlaqə' : 'Contact Us'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-base">
            {language === 'tr'
              ? 'OnayTR hizmetleri, ön satış sorularınız veya kurumsal iş birlikleri için aşağıdaki formu doldurarak bizimle iletişime geçebilirsiniz.'
              : language === 'az'
              ? 'OnayTR xidmətləri, satış öncəsi suallarınız və ya korporativ əməkdaşlıqlar üçün aşağıdakı formanı dolduraraq bizimlə əlaqə saxlaya bilərsiniz.'
              : 'You can contact us regarding OnayTR services, pre-sale questions, or corporate partnerships by filling out the form below.'}
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          
          {/* Contact Details (5 Columns) */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Box 1: Support Email */}
            <div className="glass-premium p-6 rounded-2xl flex gap-4 items-center shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-[#4648d4]/10 text-[#4648d4] flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
                  {language === 'tr' ? 'E-Posta Adresi' : language === 'az' ? 'E-Poçt Ünvanı' : 'Email Address'}
                </span>
                <a href="mailto:support@onaytr.com" className="font-bold text-slate-850 dark:text-slate-200 hover:text-[#4648d4] transition-colors text-sm">
                  support@onaytr.com
                </a>
              </div>
            </div>

            {/* Box 2: Operating Hours */}
            <div className="glass-premium p-6 rounded-2xl flex gap-4 items-center shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-[#712ae2]/10 text-[#712ae2] flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
                  {language === 'tr' ? 'Çalışma Saatleri' : language === 'az' ? 'İş Saatları' : 'Working Hours'}
                </span>
                <span className="font-bold text-slate-850 dark:text-slate-200 text-sm">
                  {language === 'tr' ? '7/24 Kesintisiz Destek' : language === 'az' ? '7/24 Fasiləsiz Dəstək' : '24/7 Continuous Support'}
                </span>
              </div>
            </div>

            {/* Box 3: Telegram Support Channel */}
            <div className="glass-premium p-6 rounded-2xl flex gap-4 items-center shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">
                  {language === 'tr' ? 'Telegram Destek' : language === 'az' ? 'Telegram Dəstək' : 'Telegram Support'}
                </span>
                <a href="https://t.me/onaytr_support" target="_blank" rel="noopener noreferrer" className="font-bold text-slate-850 dark:text-slate-200 hover:text-[#4648d4] transition-colors text-sm">
                  @onaytr_support
                </a>
              </div>
            </div>

          </div>

          {/* Form Panel (7 Columns) */}
          <div className="md:col-span-7">
            <div className="glass-premium p-8 rounded-3xl shadow-sm relative overflow-hidden">
              
              {!isSent ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {error && (
                    <div className="p-4 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                      {language === 'tr' ? 'Adınız Soyadınız' : language === 'az' ? 'Adınız Soyadınız' : 'Your Full Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={language === 'tr' ? 'Örn: Ahmet Yılmaz' : language === 'az' ? 'Məs: Elvin Məmmədov' : 'E.g. John Doe'}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/10 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all text-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                      {language === 'tr' ? 'E-Posta Adresiniz' : language === 'az' ? 'E-Poçt Ünvanınız' : 'Your Email'}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@mail.com"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/10 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all text-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Message field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                      {language === 'tr' ? 'Mesajınız' : language === 'az' ? 'Mesajınız' : 'Your Message'}
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={language === 'tr' ? 'Sorularınızı veya talebinizi detaylıca buraya yazın...' : language === 'az' ? 'Suallarınızı və ya sorğunuzu ətraflı bura yazın...' : 'Write your questions or request here...'}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/10 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all text-slate-800 dark:text-white resize-none"
                    />
                  </div>

                  {/* Cloudflare Turnstile */}
                  <TurnstileWidget
                    onVerify={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken('')}
                  />

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#4648d4] to-[#712ae2] hover:from-[#3b3db8] hover:to-[#5e22be] text-white font-bold py-3.5 rounded-xl shadow-[0_8px_20px_rgba(70,72,212,0.2)] hover:shadow-[0_8px_25px_rgba(70,72,212,0.3)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-75 disabled:hover:translate-y-0 cursor-pointer text-sm"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        {language === 'tr' ? 'Mesajı Gönder' : language === 'az' ? 'Mesajı Göndər' : 'Send Message'}
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>

                </form>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 animate-bounce" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white display-font mb-3">
                    {language === 'tr' ? 'Mesajınız İletildi' : language === 'az' ? 'Mesajınız Göndərildi' : 'Message Sent'}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold max-w-sm mb-6 leading-relaxed">
                    {language === 'tr' 
                      ? 'Mesajınız bize başarıyla ulaştı. Destek temsilcimiz en geç 2 saat içinde e-posta adresiniz üzerinden geri dönüş sağlayacaktır.' 
                      : language === 'az'
                      ? 'Mesajınız uğurla çatdı. Dəstək nümayəndəmiz ən gec 2 saat ərzində e-poçt ünvanınız vasitəsilə sizə cavab verəcəkdir.'
                      : 'Your message has been successfully sent. A support agent will respond to your email address within 2 hours.'}
                  </p>
                  <button
                    onClick={() => setIsSent(false)}
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-250 font-bold rounded-xl text-xs transition-all border border-slate-200/50 dark:border-slate-700/50"
                  >
                    {language === 'tr' ? 'Yeni Mesaj Gönder' : language === 'az' ? 'Yeni Mesaj Göndər' : 'Send Another Message'}
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
