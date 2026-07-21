"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Wallet, CreditCard, ShoppingBag, Bitcoin, ShieldCheck, ArrowRight, Loader2, X, Tag, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

const predefinedAmounts = [50, 100, 250, 500, 1000, 2500];

export default function BalanceClient({ minDeposit }: { minDeposit: number }) {
  const { data: session } = useSession();
  const user = session?.user as any;
  const { t, language } = useLanguage();
  
  const [amount, setAmount] = useState<number | ''>(100);
  const [method, setMethod] = useState<'paytr' | 'shopier' | 'oxapay'>('paytr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paytrToken, setPaytrToken] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<{ discount: number; finalAmount: number; message: string } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponResult(null);
    setCouponLoading(true);
    try {
      const res = await fetch('/api/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, amount: Number(amount) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) setCouponError(data.error || (language === 'tr' ? 'Geçersiz kupon' : language === 'az' ? 'Keçərsiz kupon' : 'Invalid coupon'));
      else setCouponResult(data);
    } catch { setCouponError(language === 'tr' ? 'Bağlantı hatası' : language === 'az' ? 'Bağlantı xətası' : 'Connection error'); }
    finally { setCouponLoading(false); }
  };

  const handlePayment = async () => {
    if (!amount || amount < minDeposit) {
      alert(
        language === 'tr' 
          ? `Lütfen en az ${minDeposit} ₺ yükleyiniz.` 
          : language === 'az' 
            ? `Zəhmət olmasa ən az ${minDeposit} ₺ yükləyin.` 
            : `Please deposit at least ${minDeposit} ₺.`
      );
      return;
    }
    if (!user) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/payment/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Ödeme başlatılamadı');

      if (method === 'paytr') {
        setPaytrToken(data.token);
      } else if (method === 'shopier') {
        // Shopier returns HTML content which contains form that redirects to Shopier
        const div = document.createElement('div');
        div.innerHTML = data.html;
        document.body.appendChild(div);
        const form = div.querySelector('form');
        if (form) {
          form.submit();
        } else {
          throw new Error('Shopier formu bulunamadı');
        }
      } else if (method === 'oxapay') {
        if (data.payLink) {
          window.location.href = data.payLink;
        } else {
          throw new Error('Oxapay ödeme linki alınamadı');
        }
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  const d = (light: string, dark: string) => isDark ? dark : light;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up">
      
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 border shadow-sm transform -rotate-3 ${d('bg-indigo-50 border-indigo-100 text-[#4648d4]', 'bg-indigo-950/20 border-indigo-900/30 text-indigo-400')}`}>
          <Wallet className="h-8 w-8" />
        </div>
        <h1 className={`text-4xl font-black display-font mb-2 ${d('text-slate-800', 'text-[#E6EDF3]')}`}>{t('nav_bakiye_yukle')}</h1>
        <p className={`font-medium max-w-md ${d('text-slate-500', 'text-[#8B949E]')}`}>
          {language === 'tr' ? 'Hesabınıza güvenle bakiye yükleyerek saniyeler içinde numara almaya başlayabilirsiniz.' : language === 'az' ? 'Hesabınıza güvənli şəkildə balans artıraraq saniyələr içində nömrə almağa başlaya bilərsiniz.' : 'Deposit balance securely to start acquiring virtual numbers within seconds.'}
        </p>
        
        {user && (
          <div className={`mt-6 flex items-center gap-3 border px-6 py-3 rounded-full shadow-sm ${d('bg-white/60 border-white', 'bg-[#161B22]/60 border-[#30363D]')}`}>
            <span className={`text-sm font-bold ${d('text-slate-500', 'text-[#8B949E]')}`}>
              {language === 'tr' ? 'Mevcut Bakiyeniz:' : language === 'az' ? 'Cari Balansınız:' : 'Your Current Balance:'}
            </span>
            <span className="text-xl font-black text-[#4648d4]">{user.balance?.toFixed(2) || '0.00'} ₺</span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Tutar Seçimi */}
        <div className={`backdrop-blur-xl border rounded-3xl p-6 flex flex-col h-full relative overflow-hidden transition-all duration-300 ${d('bg-white/60 border-white/40 shadow-lg', 'bg-[#161B22]/90 border-[#30363D] shadow-xl')}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          <h2 className={`text-lg font-black display-font mb-4 flex items-center gap-2 ${d('text-slate-805', 'text-[#E6EDF3]')}`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${d('bg-indigo-50 text-indigo-700', 'bg-indigo-950/20 text-indigo-450')}`}>1</span>
            {language === 'tr' ? 'Tutar Seçin' : language === 'az' ? 'Məbləğ Seçin' : 'Select Amount'}
          </h2>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            {predefinedAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className={`py-3 rounded-xl font-black text-[15px] border transition-all duration-300 ${
                  amount === amt
                    ? 'bg-gradient-to-r from-[#4648d4] to-[#712ae2] text-white border-transparent shadow-[0_4px_12px_rgba(70,72,212,0.25)] transform scale-105'
                    : d('bg-white/70 text-slate-600 border-slate-100 hover:border-indigo-200 hover:bg-white', 'bg-[#21262D]/70 border-[#30363D] text-[#8B949E] hover:border-indigo-800 hover:bg-[#21262D]')
                }`}
              >
                {amt} ₺
              </button>
            ))}
          </div>

          <div className="mt-auto space-y-4">
            <div>
              <label className={`block text-xs font-bold mb-2 ${d('text-slate-500', 'text-[#8B949E]')}`}>
                {language === 'tr' ? 'Farklı Bir Tutar Girin' : language === 'az' ? 'Fərqli Məbləğ Daxil Edin' : 'Enter Different Amount'}
              </label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4648d4] to-[#712ae2] rounded-xl opacity-0 group-focus-within:opacity-30 blur transition-opacity duration-300"></div>
                <input
                  type="number"
                  min={minDeposit}
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value ? Number(e.target.value) : ''); setCouponResult(null); }}
                  className={`relative w-full border text-2xl font-black rounded-xl px-4 py-4 focus:outline-none focus:border-indigo-500 transition-all text-center ${d('bg-white/80 border-slate-200 text-slate-800', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3]')}`}
                  placeholder={language === 'tr' ? 'Örn: 150' : language === 'az' ? 'Məs: 150' : 'E.g. 150'}
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">₺</span>
              </div>
            </div>

            {/* Kupon Kodu */}
            <div>
              <label className={`block text-xs font-bold mb-2 flex items-center gap-1.5 ${d('text-slate-500', 'text-[#8B949E]')}`}>
                <Tag className="h-3.5 w-3.5 text-indigo-500" /> {language === 'tr' ? 'Promosyon / Kupon Kodu' : language === 'az' ? 'Promosyon / Kupon Kodu' : 'Promo / Coupon Code'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); setCouponError(''); }}
                  placeholder="KUPON10"
                  className={`flex-1 border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 uppercase tracking-widest ${d('bg-white/80 border-slate-200 text-slate-800', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3]')}`}
                />
                <button
                  onClick={applyCoupon}
                  disabled={!couponCode || couponLoading}
                  className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white rounded-xl font-bold text-sm transition-all"
                >
                  {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (language === 'tr' ? 'Uygula' : language === 'az' ? 'Tətbiq Et' : 'Apply')}
                </button>
              </div>
              {couponError && <p className="text-red-500 text-xs font-semibold mt-1.5 text-left">{couponError}</p>}
              {couponResult && (
                <div className={`mt-2 p-3 border rounded-xl flex items-start gap-2 text-left ${d('bg-indigo-50/50 border-indigo-200', 'bg-indigo-950/20 border-indigo-900/30')}`}>
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className={`font-bold text-sm ${d('text-indigo-850', 'text-[#E6EDF3]')}`}>{couponResult.message}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {couponResult.discount.toFixed(2)}₺ {language === 'tr' ? 'indirim' : language === 'az' ? 'endirim' : 'discount'} → {language === 'tr' ? 'Ödenecek:' : language === 'az' ? 'Ödəniləcək:' : 'To Pay:'} <strong className="text-emerald-500">{couponResult.finalAmount.toFixed(2)}₺</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ödeme Yöntemi */}
        <div className={`backdrop-blur-xl border rounded-3xl p-6 flex flex-col h-full relative overflow-hidden transition-all duration-300 ${d('bg-white/60 border-white/40 shadow-lg', 'bg-[#161B22]/90 border-[#30363D] shadow-xl')}`}>
          
          <h2 className={`text-lg font-black display-font mb-4 flex items-center gap-2 ${d('text-slate-805', 'text-[#E6EDF3]')}`}>
            <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${d('bg-indigo-50 text-indigo-700', 'bg-indigo-950/20 text-indigo-450')}`}>2</span>
            {language === 'tr' ? 'Ödeme Yöntemi' : language === 'az' ? 'Ödəniş Metodu' : 'Payment Method'}
          </h2>

          <div className="flex flex-col gap-3 mb-8">
            <label className={`relative flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all duration-300 ${method === 'paytr' ? d('bg-indigo-50/50 border-indigo-300 shadow-sm', 'bg-indigo-950/20 border-indigo-800/40 shadow-sm') : d('bg-white/50 border-slate-100 hover:bg-white hover:border-indigo-200', 'bg-[#21262D]/60 border-[#30363D] hover:bg-[#21262D] hover:border-indigo-800')}`}>
              <input type="radio" name="method" value="paytr" checked={method === 'paytr'} onChange={() => setMethod('paytr')} className="sr-only" />
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${method === 'paytr' ? 'border-indigo-500' : 'border-slate-350'}`}>
                {method === 'paytr' && <div className="h-2.5 w-2.5 rounded-full bg-indigo-550" />}
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center shadow-sm border bg-white border-slate-100 text-indigo-600 dark:bg-[#161B22] dark:border-[#30363D] dark:text-indigo-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className={`font-bold ${d('text-slate-800', 'text-[#E6EDF3]')}`}>{language === 'tr' ? 'Kredi Kartı / Havale' : language === 'az' ? 'Kredit Kartı / Köçürmə' : 'Credit Card / Wire'}</span>
                <span className="text-xs font-semibold text-slate-400">{language === 'tr' ? 'PayTR Güvencesiyle (Anında)' : language === 'az' ? 'PayTR Zəmanəti ilə (Dərhal)' : 'With PayTR Guarantee (Instant)'}</span>
              </div>
            </label>

            <label className={`relative flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all duration-300 ${method === 'shopier' ? d('bg-orange-50/50 border-orange-300 shadow-sm', 'bg-orange-950/20 border-orange-850/40 shadow-sm') : d('bg-white/50 border-slate-100 hover:bg-white hover:border-orange-200', 'bg-[#21262D]/60 border-[#30363D] hover:bg-[#21262D] hover:border-orange-800')}`}>
              <input type="radio" name="method" value="shopier" checked={method === 'shopier'} onChange={() => setMethod('shopier')} className="sr-only" />
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${method === 'shopier' ? 'border-orange-500' : 'border-slate-350'}`}>
                {method === 'shopier' && <div className="h-2.5 w-2.5 rounded-full bg-orange-550" />}
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center shadow-sm border bg-white border-slate-100 text-orange-600 dark:bg-[#161B22] dark:border-[#30363D] dark:text-orange-400">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className={`font-bold ${d('text-slate-800', 'text-[#E6EDF3]')}`}>Shopier ({language === 'tr' ? 'Kredi Kartı' : language === 'az' ? 'Kredit Kartı' : 'Credit Card'})</span>
                <span className="text-xs font-semibold text-slate-400">{language === 'tr' ? 'Shopier altyapısı (Anında)' : language === 'az' ? 'Shopier infrastrukturu (Dərhal)' : 'Shopier Infrastructure (Instant)'}</span>
              </div>
            </label>

            <label className={`relative flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all duration-300 ${method === 'oxapay' ? d('bg-indigo-50/50 border-indigo-300 shadow-sm', 'bg-indigo-950/20 border-indigo-850/40 shadow-sm') : d('bg-white/50 border-slate-100 hover:bg-white hover:border-indigo-200', 'bg-[#21262D]/60 border-[#30363D] hover:bg-[#21262D] hover:border-indigo-800')}`}>
              <input type="radio" name="method" value="oxapay" checked={method === 'oxapay'} onChange={() => setMethod('oxapay')} className="sr-only" />
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${method === 'oxapay' ? 'border-indigo-500' : 'border-slate-350'}`}>
                {method === 'oxapay' && <div className="h-2.5 w-2.5 rounded-full bg-indigo-550" />}
              </div>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center shadow-sm border bg-white border-slate-100 text-indigo-600 dark:bg-[#161B22] dark:border-[#30363D] dark:text-indigo-400">
                <Bitcoin className="h-5 w-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className={`font-bold ${d('text-slate-800', 'text-[#E6EDF3]')}`}>{language === 'tr' ? 'Kripto Para' : language === 'az' ? 'Kripto Pul' : 'Cryptocurrency'}</span>
                <span className="text-xs font-semibold text-slate-400">USDT, TRX, BTC ({language === 'tr' ? 'Otomatik Onay' : language === 'az' ? 'Avtomatik Təsdiq' : 'Auto Approval'})</span>
              </div>
              <div className="ml-auto hidden sm:block">
                 <span className={`text-[9px] font-black px-2.5 py-1 rounded-full border ${d('bg-indigo-50 border-indigo-150 text-indigo-700', 'bg-indigo-950/40 border-indigo-900/30 text-indigo-400')}`}>{language === 'tr' ? 'KOMİSYONSUZ' : language === 'az' ? 'KOMİSSİYASIZ' : 'NO COMMISSION'}</span>
              </div>
            </label>
          </div>

          <button 
            onClick={handlePayment}
            disabled={isProcessing || !amount || amount < minDeposit}
            className="w-full mt-auto py-4 bg-gradient-to-r from-[#4648d4] to-[#712ae2] hover:from-[#3b3db8] hover:to-[#5e22be] disabled:opacity-50 text-white rounded-xl shadow-lg transition-all font-bold text-lg flex items-center justify-center gap-2 group hover:scale-[1.01]"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {language === 'tr' ? 'Ödemeye Geç' : language === 'az' ? 'Ödənişə Keç' : 'Proceed to Payment'}
                <ArrowRight className="h-5 w-5 opacity-70 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> 256-bit SSL {language === 'tr' ? 'Güvenli Ödeme Ağı' : language === 'az' ? 'Təhlükəsiz Ödəniş Şəbəkəsi' : 'Secure Payment Network'}
          </div>

        </div>

      </div>

      {paytrToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
          <div className={`rounded-3xl overflow-hidden w-full max-w-4xl shadow-2xl relative border animate-scale-in ${d('bg-white border-white/60', 'bg-slate-900 border-slate-800/80')}`}>
            <div className={`px-6 py-4.5 border-b flex items-center justify-between backdrop-blur-md ${d('bg-slate-50/50 border-slate-100', 'bg-slate-950/50 border-slate-900')}`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${d('bg-indigo-50 border-indigo-100 text-indigo-650', 'bg-indigo-950/20 border-indigo-900/30 text-indigo-400')}`}>
                  <CreditCard className="h-4.5 w-4.5" />
                </div>
                <span className={`font-extrabold text-lg display-font ${d('text-slate-800', 'text-[#E6EDF3]')}`}>PayTR {language === 'tr' ? 'Güvenli Ödeme Paneli' : language === 'az' ? 'Təhlükəsiz Ödəniş Paneli' : 'Secure Payment Panel'}</span>
              </div>
              <button 
                onClick={() => setPaytrToken(null)}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${d('hover:bg-slate-100 text-slate-400 hover:text-slate-600', 'hover:bg-slate-800 text-slate-400 hover:text-slate-200')}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className={`p-2 ${d('bg-slate-50/30', 'bg-slate-950/30')}`}>
              <iframe 
                src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`} 
                className="w-full h-[650px] border-0 rounded-2xl shadow-inner bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
