import prisma from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { cookies } from 'next/headers';
import { User, CreditCard, History, Clock, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { TransactionType } from '@prisma/client';
import ProfileSettingsClient from '@/components/ProfileSettingsClient';
import ReferralCard from '@/components/ReferralCard';
import TwoFACard from '@/components/TwoFACard';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await auth();
  const cookieStore = await cookies();
  const language = cookieStore.get('preferred_language')?.value || 'tr';
  
  if (!session?.user?.email) {
    redirect('/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 50
      }
    }
  });

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in-up">
      
      <div className="flex items-center gap-4 mb-10">
        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center border shadow-sm ${user && 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/20 text-[#4648d4] dark:text-indigo-400'}`}>
          <User className="h-8 w-8" />
        </div>
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-800 dark:text-[#E6EDF3] display-font">{language === 'tr' ? 'Profilim' : language === 'az' ? 'Profilim' : 'My Profile'}</h1>
          <p className="text-slate-500 dark:text-[#8B949E] font-medium mt-1">
            {language === 'tr' ? 'Hesap bilgilerinizi ve harcama geçmişinizi görüntüleyin.' : language === 'az' ? 'Hesab məlumatlarınızı və xərcləmə tarixçənizi görüntüləyin.' : 'View your account details and transaction history.'}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* User Info */}
        <div className="md:col-span-2 border rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-center bg-white/60 dark:bg-[#161B22]/90 border-white/50 dark:border-[#30363D] shadow-lg">
          <h2 className="text-lg font-black text-slate-800 dark:text-[#E6EDF3] display-font mb-4 border-b dark:border-[#30363D] pb-2 text-left">
            {language === 'tr' ? 'Hesap Bilgileri' : language === 'az' ? 'Hesab Məlumatları' : 'Account Information'}
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-[#8B949E] font-medium">{language === 'tr' ? 'E-Posta' : language === 'az' ? 'E-Poçt' : 'Email'}</span>
              <span className="font-extrabold text-slate-800 dark:text-[#E6EDF3]">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-[#8B949E] font-medium">{language === 'tr' ? 'Kayıt Tarihi' : language === 'az' ? 'Qeydiyyat Tarixi' : 'Registration Date'}</span>
              <span className="font-extrabold text-slate-800 dark:text-[#E6EDF3]">{new Date(user.createdAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : language === 'az' ? 'az-AZ' : 'en-US')}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-500 dark:text-[#8B949E] font-medium">{language === 'tr' ? 'API Erişimi' : language === 'az' ? 'API Girişi' : 'API Access'}</span>
              <Link href="/developer" className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 text-indigo-650 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all shadow-xs">
                {language === 'tr' ? 'Yönet / API Anahtarı Al' : language === 'az' ? 'İdarə Et / API Açarı Al' : 'Manage / Get API Key'}
              </Link>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="border rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50/50 to-white dark:from-[#21262D]/60 dark:to-[#161B22]/80 border-indigo-150 dark:border-indigo-900/20 shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <CreditCard className="h-8 w-8 text-[#4648d4] dark:text-indigo-400 mb-4 relative z-10" />
          <span className="text-slate-500 dark:text-[#8B949E] font-bold mb-1 relative z-10 text-left">{language === 'tr' ? 'Mevcut Bakiye' : language === 'az' ? 'Cari Balans' : 'Current Balance'}</span>
          <span className="text-4xl font-black text-indigo-700 dark:text-indigo-400 display-font relative z-10 text-left">{user.balance.toFixed(2)} ₺</span>
        </div>
      </div>

      {/* Profile Settings Toggle Component */}
      <ProfileSettingsClient initialAutoFallback={user.autoFallback} />

      <div className="h-10"></div>

      {/* Transactions List */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-left text-slate-800 dark:text-[#E6EDF3]">
        <History className="h-5 w-5 text-indigo-500" /> {language === 'tr' ? 'İşlem Geçmişi' : language === 'az' ? 'Əməliyyat Tarixçəsi' : 'Transaction History'}
      </h2>

      <div className="overflow-hidden border rounded-3xl bg-white/60 dark:bg-[#161B22]/90 border-white/50 dark:border-[#30363D] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/40 dark:bg-[#0D1117]/60 border-b border-white/60 dark:border-[#30363D] text-slate-650 dark:text-[#8B949E] text-xs font-black uppercase tracking-wider">
                <th className="p-4">{language === 'tr' ? 'Tarih' : language === 'az' ? 'Tarix' : 'Date'}</th>
                <th className="p-4">{language === 'tr' ? 'İşlem Türü' : language === 'az' ? 'Əməliyyat Növü' : 'Transaction Type'}</th>
                <th className="p-4">{language === 'tr' ? 'Açıklama' : language === 'az' ? 'Açıqlama' : 'Description'}</th>
                <th className="p-4 text-right">{language === 'tr' ? 'Tutar' : language === 'az' ? 'Məbləğ' : 'Amount'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#30363D]/40">
              {user.transactions.map((tx) => {
                const isDeposit = tx.amount > 0 && tx.type === TransactionType.DEPOSIT;
                const isRefund = tx.amount > 0 && tx.type === TransactionType.REFUND;
                const isPositive = tx.amount > 0;

                return (
                  <tr key={tx.id} className="transition-colors hover:bg-slate-50/25 dark:hover:bg-[#21262D]/20">
                    <td className="p-4 text-sm text-slate-500 dark:text-[#8B949E] font-semibold flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(tx.createdAt).toLocaleString(language === 'tr' ? 'tr-TR' : language === 'az' ? 'az-AZ' : 'en-US')}
                    </td>
                    <td className="p-4 text-left">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md uppercase border ${
                        isDeposit ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/30' : 
                        isRefund ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-250 dark:border-blue-900/30' :
                        'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-250 dark:border-rose-900/30'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-slate-700 dark:text-[#E6EDF3] text-left">
                      {tx.description || '-'}
                    </td>
                    <td className="p-4 text-right font-black flex justify-end items-center gap-1">
                      {isPositive ? (
                        <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1"><ArrowUpCircle className="h-4 w-4" /> +{tx.amount.toFixed(2)} ₺</span>
                      ) : (
                        <span className="text-rose-500 dark:text-rose-450 flex items-center gap-1"><ArrowDownCircle className="h-4 w-4" /> {tx.amount.toFixed(2)} ₺</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {user.transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 font-bold">
                    {language === 'tr' ? 'Henüz işlem geçmişiniz bulunmuyor.' : language === 'az' ? 'Hələ əməliyyat tarixçəniz yoxdur.' : 'You do not have any transaction history yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Referral Program */}
      <div className="mt-8">
        <ReferralCard />
      </div>

      {/* 2FA Security */}
      <TwoFACard />
    </div>
  );
}
