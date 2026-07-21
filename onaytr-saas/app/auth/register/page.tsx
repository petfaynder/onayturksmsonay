"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, Loader2, UserPlus } from 'lucide-react';
import TurnstileWidget from '@/components/TurnstileWidget';
import { useLanguage } from '@/components/LanguageProvider';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError(t('auth_password_mismatch'));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, turnstileToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('auth_register_error'));
        setIsLoading(false);
      } else {
        router.push('/auth/login?registered=true');
      }
    } catch (err) {
      setError(t('auth_system_error'));
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-[#F8F9FF] dark:bg-[#0D1117] pt-20">
      
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#712ae2]/10 dark:bg-[#712ae2]/5 rounded-full blur-[120px] -z-10 animate-float"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4648d4]/10 dark:bg-[#4648d4]/5 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute inset-0 micro-grid opacity-70 -z-20"></div>

      <div className="w-full max-w-md glass-premium p-8 md:p-10 rounded-3xl shadow-xl relative group overflow-hidden">
        
        {/* Subtle Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-bl from-[#4648d4]/5 to-[#712ae2]/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="h-16 w-16 bg-gradient-to-br from-[#4648d4] to-[#712ae2] rounded-2xl flex items-center justify-center shadow-lg shadow-[#4648d4]/20 mb-4 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white display-font mb-2">{t('auth_register_title')}</h1>
          <p className="text-slate-500 dark:text-slate-450 text-sm font-medium text-center">{t('auth_register_desc')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-bold flex items-center justify-center backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Google Register Button */}
        <button
          onClick={handleGoogleRegister}
          disabled={googleLoading}
          className="w-full mb-5 flex items-center justify-center gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold py-3.5 rounded-xl shadow-sm transition-all relative z-10 disabled:opacity-60 cursor-pointer"
        >
          {googleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('auth_google_register')}
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-5 relative z-10">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">{t('auth_or')}</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Email input */}
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

          {/* Password input */}
          <div className="space-y-1.5 text-left">
            <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">{t('auth_password')}</label>
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within/input:text-[#4648d4] transition-colors" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-11 pr-4 py-3.5 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/10 dark:focus:border-[#4648d4] dark:focus:ring-[#4648d4]/10 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 font-medium outline-none transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Password confirm input */}
          <div className="space-y-1.5 text-left">
            <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">{t('auth_password_confirm')}</label>
            <div className="relative group/input">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within/input:text-[#4648d4] transition-colors" />
              </div>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                minLength={6}
                className="w-full pl-11 pr-4 py-3.5 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 focus:border-[#4648d4] focus:ring-2 focus:ring-[#4648d4]/10 dark:focus:border-[#4648d4] dark:focus:ring-[#4648d4]/10 focus:bg-white dark:focus:bg-slate-900 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 font-medium outline-none transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Cloudflare Turnstile */}
          <TurnstileWidget
            onVerify={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken('')}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-gradient-to-r from-[#4648d4] to-[#712ae2] hover:from-[#3b3db8] hover:to-[#5e22be] text-white font-bold py-4 rounded-xl shadow-[0_8px_20px_rgba(70,72,212,0.25)] hover:shadow-[0_8px_25px_rgba(70,72,212,0.35)] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {t('auth_register_btn')} <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-450">
            {t('auth_have_account')}{' '}
            <Link href="/auth/login" className="font-bold text-[#4648d4] hover:text-[#712ae2] hover:underline">
              {t('auth_login_link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
