"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Mail, Calendar, Shield, Wallet, ShoppingCart,
  CreditCard, MessageSquare, Ban, CheckCircle2, RefreshCw,
  Key, Globe, Loader2, Save, Copy, AlertTriangle, Clock,
  Hash, Phone, DollarSign, Tag, Network, UserCog, Lock,
  Plus, Minus, StickyNote, X, TrendingUp
} from 'lucide-react';

type TabType = 'orders' | 'transactions' | 'tickets';
type BalanceMode = 'set' | 'add' | 'subtract';

export default function AdminUserDetailClient({ user }: { user: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [isLoading, setIsLoading] = useState(false);
  const [editBalance, setEditBalance] = useState(false);
  const [balanceMode, setBalanceMode] = useState<BalanceMode>('set');
  const [balanceValue, setBalanceValue] = useState(user.balance?.toString() || '0');
  const [editRole, setEditRole] = useState(false);
  const [roleValue, setRoleValue] = useState(user.role);
  const [editTier, setEditTier] = useState(false);
  const [tierValue, setTierValue] = useState(user.tierLevel || 'BRONZE');
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [noteText, setNoteText] = useState(user.adminNote || '');
  const [currentBalance, setCurrentBalance] = useState<number>(parseFloat(user.balance || '0'));

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...data }),
      });
      if (res.ok) {
        const json = await res.json();
        // Update local balance display
        if (json.user?.balance !== undefined) {
          setCurrentBalance(parseFloat(json.user.balance));
        }
        showToast('Güncellendi ✓');
        router.refresh();
        setEditBalance(false);
        setEditRole(false);
        setEditTier(false);
        setShowNoteEditor(false);
      } else {
        const err = await res.json();
        showToast(err.error || 'Bir hata oluştu', 'error');
      }
    } catch {
      showToast('Bağlantı hatası', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBalanceSave = () => {
    const num = parseFloat(balanceValue);
    if (isNaN(num)) { showToast('Geçersiz değer', 'error'); return; }
    if (balanceMode === 'set') {
      handleAction({ balance: num });
    } else if (balanceMode === 'add') {
      handleAction({ balance: currentBalance + num });
    } else {
      handleAction({ balance: Math.max(0, currentBalance - num) });
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
      COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
      REFUNDED: 'bg-blue-100 text-blue-700 border-blue-200',
      OPEN: 'bg-blue-100 text-blue-700 border-blue-200',
      IN_PROGRESS: 'bg-amber-100 text-amber-700 border-amber-200',
      RESOLVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return map[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="p-2.5 bg-white/60 hover:bg-white border border-white/80 rounded-xl transition-all shadow-sm"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-slate-800 display-font">Kullanıcı Detayı</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">{user.email}</p>
        </div>
        {user.isBanned && (
          <div className="flex items-center gap-2 px-4 py-2 bg-rose-100 border border-rose-200 rounded-xl">
            <Ban className="h-4 w-4 text-rose-600" />
            <span className="text-sm font-bold text-rose-600">Yasaklı Hesap</span>
          </div>
        )}
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Email & ID */}
        <div className="bg-white/60 border border-white/80 rounded-2xl p-5 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-3">
            <Mail className="h-3.5 w-3.5" /> E-Posta & Kimlik
          </div>
          <div className="space-y-2.5">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">E-Posta</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800 break-all">{user.email}</span>
                <button onClick={() => copyText(user.email)} className="text-slate-400 hover:text-teal-600 transition-colors shrink-0">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">User ID</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-600 break-all">{user.id}</span>
                <button onClick={() => copyText(user.id)} className="text-slate-400 hover:text-teal-600 transition-colors shrink-0">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {user.googleId && (
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Google ID</span>
                <span className="text-xs font-mono text-slate-600 block">{user.googleId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Balance */}
        <div className="bg-white/60 border border-white/80 rounded-2xl p-5 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-3">
            <Wallet className="h-3.5 w-3.5" /> Bakiye
          </div>
           {editBalance ? (
            <div className="space-y-3">
              <div className="flex rounded-lg overflow-hidden border border-slate-200">
                <button
                  type="button"
                  onClick={() => { setBalanceMode('set'); setBalanceValue('0'); }}
                  className={`flex-1 py-1.5 text-xs font-black transition-colors ${balanceMode === 'set' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Eşitle
                </button>
                <button
                  type="button"
                  onClick={() => { setBalanceMode('add'); setBalanceValue('10'); }}
                  className={`flex-1 py-1.5 text-xs font-black transition-colors ${balanceMode === 'add' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Ekle (+)
                </button>
                <button
                  type="button"
                  onClick={() => { setBalanceMode('subtract'); setBalanceValue('10'); }}
                  className={`flex-1 py-1.5 text-xs font-black transition-colors ${balanceMode === 'subtract' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Çıkar (-)
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={balanceValue}
                  onChange={(e) => setBalanceValue(e.target.value)}
                  className="w-full px-3 py-2 text-lg font-black border border-teal-300 rounded-xl outline-none focus:ring-2 ring-teal-500/20"
                />
                <button
                  onClick={handleBalanceSave}
                  disabled={isLoading}
                  className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-sm shrink-0"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => { setEditBalance(false); setBalanceValue(user.balance?.toString() || '0'); }}
                  className="p-2.5 bg-slate-200 text-slate-600 rounded-xl shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>

          ) : (
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-teal-600">{currentBalance.toFixed(2)} ₺</span>
              <button
                onClick={() => setEditBalance(true)}
                className="p-2 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-xl transition-colors"
                title="Bakiye Düzenle"
              >
                <CreditCard className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Role & Status */}
        <div className="bg-white/60 border border-white/80 rounded-2xl p-5 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-3">
            <Shield className="h-3.5 w-3.5" /> Rol & Durum
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Rol</span>
              {editRole ? (
                <div className="flex items-center gap-2 mt-1">
                  <select
                    value={roleValue}
                    onChange={(e) => setRoleValue(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm font-bold border border-teal-300 rounded-lg outline-none"
                  >
                    <option value="USER">USER</option>
                    <option value="RESELLER">RESELLER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <button
                    onClick={() => handleAction({ role: roleValue })}
                    disabled={isLoading}
                    className="p-1.5 bg-emerald-500 text-white rounded-lg"
                  >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                    user.role === 'ADMIN' ? 'bg-rose-100 text-rose-600 border-rose-200'
                      : user.role === 'RESELLER' ? 'bg-violet-100 text-violet-600 border-violet-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {user.role}
                  </span>
                  <button onClick={() => setEditRole(true)} className="text-slate-400 hover:text-teal-600">
                    <UserCog className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Durum</span>
              <div className="flex items-center gap-1.5 mt-1">
                {user.isBanned ? (
                  <span className="text-rose-500 font-bold flex items-center gap-1 text-sm"><Ban className="h-3.5 w-3.5" /> Yasaklı</span>
                ) : (
                  <span className="text-emerald-500 font-bold flex items-center gap-1 text-sm"><CheckCircle2 className="h-3.5 w-3.5" /> Aktif</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Oto Fallback</span>
              <span className={`text-sm font-bold block mt-0.5 ${user.autoFallback ? 'text-emerald-600' : 'text-slate-500'}`}>
                {user.autoFallback ? 'Açık ✓' : 'Kapalı'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Üyelik Seviyesi (Tier)</span>
              {editTier ? (
                <div className="flex items-center gap-2 mt-1">
                  <select
                    value={tierValue}
                    onChange={(e) => setTierValue(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-bold border border-teal-300 rounded-lg outline-none"
                  >
                    <option value="BRONZE">BRONZE</option>
                    <option value="SILVER">SILVER</option>
                    <option value="GOLD">GOLD</option>
                    <option value="PLATINUM">PLATINUM</option>
                  </select>
                  <button
                    onClick={() => handleAction({ tierLevel: tierValue })}
                    disabled={isLoading}
                    className="p-1.5 bg-emerald-500 text-white rounded-lg"
                  >
                    {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                    user.tierLevel === 'PLATINUM' ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                      : user.tierLevel === 'GOLD' ? 'bg-amber-100 text-amber-700 border-amber-200'
                      : user.tierLevel === 'SILVER' ? 'bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-orange-100 text-orange-700 border-orange-200'
                  }`}>
                    {user.tierLevel || 'BRONZE'}
                  </span>
                  <button onClick={() => setEditTier(true)} className="text-slate-400 hover:text-teal-600">
                    <UserCog className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dates & Stats */}
        <div className="bg-white/60 border border-white/80 rounded-2xl p-5 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-3">
            <Calendar className="h-3.5 w-3.5" /> Tarih & İstatistik
          </div>
          <div className="space-y-2.5">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Kayıt Tarihi</span>
              <span className="text-sm font-bold text-slate-700 block">{formatDate(user.createdAt)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Son Güncelleme</span>
              <span className="text-sm font-bold text-slate-700 block">{formatDate(user.updatedAt)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="text-center bg-teal-50 rounded-lg py-1.5 border border-teal-100">
                <span className="text-lg font-black text-teal-700">{user._count?.orders || 0}</span>
                <span className="text-[9px] text-teal-600 font-bold block">Sipariş</span>
              </div>
              <div className="text-center bg-blue-50 rounded-lg py-1.5 border border-blue-100">
                <span className="text-lg font-black text-blue-700">{user._count?.tickets || 0}</span>
                <span className="text-[9px] text-blue-600 font-bold block">Destek</span>
              </div>
            </div>
          </div>
        </div>

        {/* Referral System */}
        <div className="bg-white/60 border border-white/80 rounded-2xl p-5 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-3">
            <Network className="h-3.5 w-3.5" /> Referans Sistemi
          </div>
          <div className="space-y-2.5">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Referans Kodu</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-bold text-slate-700">{user.referralCode || 'Yok'}</span>
                {user.referralCode && (
                  <button onClick={() => copyText(user.referralCode)} className="text-slate-400 hover:text-teal-600 transition-colors">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Davet Eden (Sponsor)</span>
              <span className="text-sm font-bold text-slate-700 block mt-0.5 break-all">
                {user.referredBy?.email ? `${user.referredBy.email} (${user.referredBy.id.slice(0,8)})` : 'Sponsor yok'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Referans Kazancı</span>
              <span className="text-sm font-black text-emerald-600 block mt-0.5">
                {parseFloat(user.referralEarnings?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0).toFixed(2)} ₺
              </span>
            </div>
          </div>
        </div>

        {/* Security & Spends */}
        <div className="bg-white/60 border border-white/80 rounded-2xl p-5 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-3">
            <Lock className="h-3.5 w-3.5" /> Güvenlik & Harcama
          </div>
          <div className="space-y-2.5">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">2FA Koruması</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border inline-block mt-1 ${user.twoFAEnabled ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {user.twoFAEnabled ? 'Aktif' : 'Aktif Değil'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Telegram Chat ID</span>
              <span className="text-xs font-mono text-slate-600 block mt-0.5">
                {user.telegramChatId || 'Bağlı değil'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Toplam Aylık Harcama</span>
              <span className="text-sm font-black text-teal-600 block mt-0.5">
                {parseFloat(user.monthlySpend || 0).toFixed(2)} ₺
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Admin Notes Card */}
      <div className="bg-white/60 border border-white/80 rounded-2xl p-5 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase">
            <StickyNote className="h-3.5 w-3.5 text-amber-500" /> Admin Özel Notu
          </div>
          {!showNoteEditor && (
            <button
              onClick={() => setShowNoteEditor(true)}
              className="text-xs font-black text-teal-600 hover:text-teal-700 transition-colors"
            >
              Düzenle
            </button>
          )}
        </div>

        {showNoteEditor ? (
          <div className="space-y-3">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Kullanıcıya özel not yazın (Sadece yöneticiler görebilir)..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 focus:border-teal-400 rounded-xl text-sm outline-none resize-none bg-white/80"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleAction({ adminNote: noteText })}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/10"
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Kaydet
              </button>
              <button
                onClick={() => { setShowNoteEditor(false); setNoteText(user.adminNote || ''); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        ) : (
          <div className={`p-3 rounded-xl border text-sm min-h-[50px] ${user.adminNote ? 'bg-amber-50/50 border-amber-100 text-slate-700 font-medium' : 'bg-slate-50 border-slate-100 text-slate-400 italic'}`}>
            {user.adminNote || "Kullanıcıya ait kaydedilmiş not bulunmuyor."}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 px-4 py-3 rounded-xl font-bold text-sm shadow-xl z-50 animate-fade-in text-white ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* API & Webhook */}
      {(user.apiToken || user.webhookUrl) && (
        <div className="bg-white/60 border border-white/80 rounded-2xl p-5 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase mb-3">
            <Key className="h-3.5 w-3.5" /> API & Webhook
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.apiToken && (
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">API Token</span>
                <div className="flex items-center gap-2 mt-1 bg-slate-50 rounded-lg p-2 border border-slate-100">
                  <code className="text-xs text-slate-600 font-mono break-all flex-1">{user.apiToken}</code>
                  <button onClick={() => copyText(user.apiToken)} className="text-slate-400 hover:text-teal-600 shrink-0">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
            {user.webhookUrl && (
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Webhook URL</span>
                <div className="flex items-center gap-2 mt-1 bg-slate-50 rounded-lg p-2 border border-slate-100">
                  <code className="text-xs text-slate-600 font-mono break-all flex-1">{user.webhookUrl}</code>
                  <button onClick={() => copyText(user.webhookUrl)} className="text-slate-400 hover:text-teal-600 shrink-0">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleAction({ isBanned: !user.isBanned })}
          disabled={isLoading || user.role === 'ADMIN'}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-50 ${
            user.isBanned
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : 'bg-rose-500 hover:bg-rose-600 text-white'
          }`}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : user.isBanned ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
          {user.isBanned ? 'Yasağı Kaldır' : 'Kullanıcıyı Yasakla'}
        </button>

        <button
          onClick={() => {
            if (confirm('Kullanıcının şifresini sıfırlamak istediğinize emin misiniz? Yeni şifre: 123456')) {
              handleAction({ resetPassword: true });
            }
          }}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-50"
        >
          <Lock className="h-4 w-4" /> Şifre Sıfırla
        </button>

        <button
          onClick={() => {
            if (confirm('Yeni API token oluşturulacak. Eski token geçersiz olacak. Devam?')) {
              handleAction({ generateApiToken: true });
            }
          }}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-50"
        >
          <Key className="h-4 w-4" /> API Token Oluştur
        </button>

        <button
          onClick={() => handleAction({ autoFallback: !user.autoFallback })}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" /> Fallback: {user.autoFallback ? 'Kapat' : 'Aç'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/40 border border-white/60 rounded-xl p-1 w-fit">
        {([
          { key: 'orders', label: 'Siparişler', icon: ShoppingCart, count: user._count?.orders },
          { key: 'transactions', label: 'İşlemler', icon: DollarSign, count: user._count?.transactions },
          { key: 'tickets', label: 'Destek', icon: MessageSquare, count: user._count?.tickets },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-teal-700 shadow-sm border border-teal-100'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
              activeTab === tab.key ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white/60 border border-white/80 rounded-2xl shadow-sm backdrop-blur-md overflow-hidden">
        
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/40 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase">
                  <th className="p-3.5">Tarih</th>
                  <th className="p-3.5">Servis</th>
                  <th className="p-3.5">Ülke</th>
                  <th className="p-3.5">Numara</th>
                  <th className="p-3.5">SMS</th>
                  <th className="p-3.5">Maliyet</th>
                  <th className="p-3.5">Satış</th>
                  <th className="p-3.5">Kâr</th>
                  <th className="p-3.5">Sağlayıcı</th>
                  <th className="p-3.5">Durum</th>
                </tr>
              </thead>
              <tbody>
                {user.orders?.length === 0 && (
                  <tr><td colSpan={10} className="p-8 text-center text-slate-400 font-bold">Sipariş bulunamadı</td></tr>
                )}
                {user.orders?.map((order: any) => (
                  <tr key={order.id} className="border-b border-slate-50 hover:bg-white/50 transition-colors text-sm">
                    <td className="p-3.5 text-slate-600 text-xs font-mono whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    <td className="p-3.5 font-bold text-slate-800 uppercase">{order.serviceCode}</td>
                    <td className="p-3.5 text-slate-600 capitalize">{order.countryCode}</td>
                    <td className="p-3.5 font-mono text-slate-700 text-xs">{order.phoneNumber}</td>
                    <td className="p-3.5">
                      {order.smsCode ? (
                        <span className="font-mono font-bold text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{order.smsCode}</span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-xs font-bold text-slate-500">{order.costPrice?.toFixed(2)} ₺</td>
                    <td className="p-3.5 text-xs font-bold text-teal-600">{order.sellPrice?.toFixed(2)} ₺</td>
                    <td className="p-3.5 text-xs font-black text-emerald-600">{(order.sellPrice - order.costPrice)?.toFixed(2)} ₺</td>
                    <td className="p-3.5 text-xs text-slate-500">{order.provider?.name || '—'}</td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${statusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/40 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase">
                  <th className="p-3.5">Tarih</th>
                  <th className="p-3.5">Tür</th>
                  <th className="p-3.5">Tutar</th>
                  <th className="p-3.5">Açıklama</th>
                  <th className="p-3.5">Referans</th>
                </tr>
              </thead>
              <tbody>
                {user.transactions?.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-bold">İşlem bulunamadı</td></tr>
                )}
                {user.transactions?.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-slate-50 hover:bg-white/50 transition-colors text-sm">
                    <td className="p-3.5 text-slate-600 text-xs font-mono whitespace-nowrap">{formatDate(tx.createdAt)}</td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                        tx.type === 'DEPOSIT' ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : tx.type === 'PURCHASE' ? 'bg-rose-100 text-rose-700 border-rose-200'
                          : tx.type === 'REFUND' ? 'bg-blue-100 text-blue-700 border-blue-200'
                          : tx.type === 'BONUS' ? 'bg-violet-100 text-violet-700 border-violet-200'
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`p-3.5 font-black text-sm ${tx.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount?.toFixed(2)} ₺
                    </td>
                    <td className="p-3.5 text-slate-600 text-xs max-w-[300px] truncate">{tx.description || '—'}</td>
                    <td className="p-3.5 text-xs font-mono text-slate-400">{tx.referenceId ? tx.referenceId.split('-')[0] : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/40 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase">
                  <th className="p-3.5">Tarih</th>
                  <th className="p-3.5">Konu</th>
                  <th className="p-3.5">Mesaj</th>
                  <th className="p-3.5">Yanıtlar</th>
                  <th className="p-3.5">Durum</th>
                  <th className="p-3.5">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {user.tickets?.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400 font-bold">Destek talebi bulunamadı</td></tr>
                )}
                {user.tickets?.map((ticket: any) => (
                  <tr key={ticket.id} className="border-b border-slate-50 hover:bg-white/50 transition-colors text-sm">
                    <td className="p-3.5 text-slate-600 text-xs font-mono whitespace-nowrap">{formatDate(ticket.createdAt)}</td>
                    <td className="p-3.5 font-bold text-slate-800">{ticket.subject}</td>
                    <td className="p-3.5 text-slate-600 text-xs max-w-[200px] truncate">{ticket.message}</td>
                    <td className="p-3.5 text-center font-bold text-slate-600">{ticket._count?.replies || 0}</td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${statusBadge(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <Link
                        href={`/admin/tickets?id=${ticket.id}`}
                        className="text-xs font-bold text-teal-600 hover:underline"
                      >
                        Görüntüle →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {copied && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg animate-fade-up z-50">
          ✓ Panoya kopyalandı
        </div>
      )}
    </div>
  );
}
