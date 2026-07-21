"use client";
import { useState, useEffect } from "react";
import { Users, Link2, Copy, CheckCircle, TrendingUp, Gift, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

interface ReferralData {
  referralCode: string;
  referralLink: string;
  totalEarnings: number;
  totalReferrals: number;
  earnings: { id: string; amount: number; createdAt: string }[];
  referredUsers: { id: string; email: string; orderCount: number; joinedAt: string }[];
}

export default function ReferralCard() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    fetch("/api/referral")
      .then(r => {
        if (!r.ok) throw new Error("Not authenticated");
        return r.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);


  const copyLink = () => {
    navigator.clipboard.writeText(data?.referralLink ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="glass-panel p-8 border border-white/60 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
    </div>
  );
  if (!data) return null;

  return (
    <div className="glass-panel border border-white/60 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-6 text-white">
        <div className="flex items-center gap-3 mb-1">
          <Gift className="h-6 w-6" />
          <h2 className="text-xl font-black">{language === 'tr' ? 'Referans Programı' : language === 'az' ? 'Referal Proqramı' : 'Referral Program'}</h2>
        </div>
        <p className="text-teal-100 text-sm">
          {language === 'tr' ? 'Her referanslı satıştan %5 komisyon kazan. Sınır yok!' : language === 'az' ? 'Hər referallı satışdan %5 komissiya qazan. Limit yoxdur!' : 'Earn 5% commission on every referral sale. No limits!'}
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-teal-50/60 border border-teal-100 rounded-2xl p-4 text-center">
            <Users className="h-5 w-5 text-teal-600 mx-auto mb-1" />
            <div className="text-3xl font-black text-teal-700">{data.totalReferrals}</div>
            <div className="text-xs font-bold text-teal-500 mt-0.5">{language === 'tr' ? 'Referans Kullanıcı' : language === 'az' ? 'Referal İstifadəçi' : 'Referral User'}</div>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 text-center">
            <TrendingUp className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
            <div className="text-3xl font-black text-emerald-700">{data.totalEarnings.toFixed(2)}&#8378;</div>
            <div className="text-xs font-bold text-emerald-500 mt-0.5">{language === 'tr' ? 'Toplam Kazanç' : language === 'az' ? 'Toplam Qazanc' : 'Total Earnings'}</div>
          </div>
        </div>

        {/* Referral Code */}
        <div>
          <label className="text-sm font-bold text-slate-600 mb-2 block flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5" /> {language === 'tr' ? 'Referans Linkiniz' : language === 'az' ? 'Referal Linkiniz' : 'Your Referral Link'}
          </label>
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-700 overflow-hidden text-ellipsis whitespace-nowrap">
              {data.referralLink}
            </div>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-bold text-sm transition-all whitespace-nowrap"
            >
              {copied ? <><CheckCircle className="h-4 w-4" /> {language === 'tr' ? 'Kopyalandı!' : language === 'az' ? 'Kopyalandı!' : 'Copied!'}</> : <><Copy className="h-4 w-4" /> {language === 'tr' ? 'Kopyala' : language === 'az' ? 'Kopyala' : 'Copy'}</>}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">{language === 'tr' ? 'Referans kodunuz:' : language === 'az' ? 'Referal kodunuz:' : 'Your referral code:'} <span className="font-black text-slate-600 font-mono tracking-widest">{data.referralCode}</span></p>
        </div>

        {/* Recent Earnings */}
        {data.earnings.length > 0 && (
          <div>
            <h3 className="text-sm font-black text-slate-700 mb-3">{language === 'tr' ? 'Son Komisyonlar' : language === 'az' ? 'Son Komissiyalar' : 'Recent Commissions'}</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {data.earnings.slice(0, 10).map(e => (
                <div key={e.id} className="flex items-center justify-between bg-slate-50/60 rounded-xl px-4 py-2.5">
                  <span className="text-xs text-slate-500">{new Date(e.createdAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'az' ? 'az-AZ' : 'en-US')}</span>
                  <span className="font-black text-emerald-600">+{e.amount.toFixed(2)}&#8378;</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referred Users */}
        {data.referredUsers.length > 0 && (
          <div>
            <h3 className="text-sm font-black text-slate-700 mb-3">{language === 'tr' ? 'Referans Kullanıcılarınız' : language === 'az' ? 'Referal İstifadəçiləriniz' : 'Your Referred Users'}</h3>
            <div className="space-y-2">
              {data.referredUsers.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between bg-slate-50/60 rounded-xl px-4 py-2.5">
                  <div>
                    <div className="text-sm font-bold text-slate-700">{u.email}</div>
                    <div className="text-xs text-slate-400">{language === 'tr' ? 'Katılım:' : language === 'az' ? 'Qoşulma:' : 'Joined:'} {new Date(u.joinedAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'az' ? 'az-AZ' : 'en-US')}</div>
                  </div>
                  <span className="text-xs font-black bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full">{language === 'tr' ? 'Üye' : language === 'az' ? 'Üzv' : 'Member'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}