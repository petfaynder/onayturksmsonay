"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import TurnstileWidget from '@/components/TurnstileWidget';
import { useLanguage } from '@/components/LanguageProvider';

export default function ForgotPasswordPage() {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate or call recovery endpoint
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || (language === 'tr' ? 'Bir hata oluştu.' : language === 'az' ? 'Bir xəta baş verdi.' : 'An error occurred.'));
        setIsLoading(false);
      } else {
        setIsSent(true);
        setIsLoading(false);
      }
    } catch (err) {
      setError(language === 'tr' ? 'Sistemsel bir hata oluştu.' : language === 'az' ? 'Sistemsel bir xəta baş verdi.' : 'A system error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-[#F8F9FF] dark:bg-[#0D1117] pt-20">
      
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4648d4]/10 dark:bg-[#4648d4]/5 rounded-full blur-[120px] -z-10 animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#712ae2]/10 dark:bg-[#712ae2]/5 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute inset-0 micro-grid opacity-70 -z-20"></div>

      <div className="w-full max-w-md glass-premium p-8 md:p-10 rounded-3xl shadow-xl relative group overflow-hidden">
        
        {/* Subtle Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4648d4]/5 to-[#712ae2]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        {!isSent ? (
          <>
            <div className="flex flex-col items-center mb-8 relative z-10">
              <div className="h-16 w-16 bg-gradient-to-br from-[#4648d4] to-[#712ae2] rounded-2xl flex items-center justify-center shadow-lg shadow-[#4648d4]/20 mb-4 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <KeyRound className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-white display-font mb-2">
                {language === 'tr' ? 'Şifremi Sıfırla' : language === 'az' ? 'Şifrəni Sıfırla' : 'Reset Password'}
              </h1>
              <p className="text-slate-500 dark:text-slate-450 text-sm font-medium text-center">
                {language === 'tr' ? 'E-posta adresinizi girerek şifre sıfırlama linki talep edin.' : language === 'az' ? 'E-poçt ünvanınızı daxil edərək şifrə sıfırlama linki tələb edin.' : 'Enter your email address to request a password reset link.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-bold flex items-center justify-center backdrop-blur-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div className="space-y-1.5 text-left">
                <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">{t('auth_email')}</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within/input:text-[#4648d4] transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/10 dark:focus:border-[#4648d4] dark:focus:ring-[#4648d4]/10 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 font-medium outline-none transition-all shadow-sm"
                    placeholder="ornek@mail.com"
                  />
                </div>
              </div>

              {/* Cloudflare Turnstile */}
              <TurnstileWidget
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken('')}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-gradient-to-r from-[#4648d4] to-[#712ae2] hover:from-[#3b3db8] hover:to-[#5e22be] text-white font-bold py-4 rounded-xl shadow-[0_8px_20px_rgba(70,72,212,0.25)] hover:shadow-[0_8px_25px_rgba(70,72,212,0.35)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {language === 'tr' ? 'Sıfırlama Linki Gönder' : language === 'az' ? 'Sıfırlama Linki Göndər' : 'Send Reset Link'} 
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white display-font mb-3">
              {language === 'tr' ? 'E-posta Gönderildi' : language === 'az' ? 'E-poçt Göndərildi' : 'Email Sent'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-8 max-w-sm">
              {language === 'tr' 
                ? `Şifre sıfırlama talimatları ${email} adresine gönderildi. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.` 
                : language === 'az'
                ? `Şifrə sıfırlama təlimatları ${email} ünvanına göndərildi. Zəhmət olmasa gələnlər qutunuzu (və spam qovluğunu) yoxlayın.`
                : `Password reset instructions have been sent to ${email}. Please check your inbox (and spam folder).`}
            </p>
          </div>
        )}

        <div className="mt-8 text-center relative z-10 border-t border-slate-100 dark:border-slate-800 pt-6">
          <Link href="/auth/login" className="font-bold text-[#4648d4] hover:text-[#712ae2] hover:underline text-sm flex items-center justify-center gap-1.5">
            <ArrowRight className="h-4 w-4 rotate-180" /> {t('auth_login_link')}
          </Link>
        </div>
      </div>
    </div>
  );
}
