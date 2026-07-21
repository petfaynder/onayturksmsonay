"use client";
import { useState, useEffect } from "react";
import { Shield, ShieldCheck, ShieldOff, QrCode, Lock, CheckCircle2, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/components/LanguageProvider";

export default function TwoFACard() {
  const [status, setStatus] = useState<"loading" | "disabled" | "setup" | "enabled">("loading");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    fetch("/api/user/2fa")
      .then(r => r.json())
      .then(d => {
        if (d.enabled) {
          setStatus("enabled");
        } else {
          setStatus("disabled");
          setQrDataUrl(d.qrDataUrl);
          setSecret(d.secret);
        }
      })
      .catch(() => setStatus("disabled"));
  }, []);

  const startSetup = async () => {
    setStatus("setup");
  };

  const enable2FA = async () => {
    if (!token || token.length !== 6) { setMsg(language === 'tr' ? 'Lütfen 6 haneli kodu girin' : language === 'az' ? 'Zəhmət olmasa 6 rəqəmli kodu daxil edin' : 'Please enter the 6-digit code'); return; }
    setSaving(true); setMsg("");
    const res = await fetch("/api/user/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.ok) {
      setStatus("enabled");
      setMsg("");
      setToken("");
    } else {
      setMsg(data.error || (language === 'tr' ? 'Hata oluştu' : language === 'az' ? 'Xəta baş verdi' : 'An error occurred'));
    }
  };

  const disable2FA = async () => {
    if (!token || token.length !== 6) { setMsg(language === 'tr' ? 'Lütfen 6 haneli kodu girin' : language === 'az' ? 'Zəhmət olmasa 6 rəqəmli kodu daxil edin' : 'Please enter the 6-digit code'); return; }
    setSaving(true); setMsg("");
    const res = await fetch("/api/user/2fa", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.ok) {
      setStatus("disabled");
      setToken("");
      setMsg("");
      // Re-fetch to get new QR code
      fetch("/api/user/2fa").then(r => r.json()).then(d => {
        setQrDataUrl(d.qrDataUrl); setSecret(d.secret);
      });
    } else {
      setMsg(data.error || (language === 'tr' ? 'Hata oluştu' : language === 'az' ? 'Xəta baş verdi' : 'An error occurred'));
    }
  };

  if (status === "loading") return null;

  return (
    <div className="glass-panel p-6 border border-white/60 mt-6">
      <div className="flex items-center gap-3 mb-4">
        {status === "enabled" 
          ? <ShieldCheck className="h-6 w-6 text-emerald-500" /> 
          : <Shield className="h-6 w-6 text-slate-400" />}
        <div>
          <h2 className="font-extrabold text-slate-800 display-font">{language === 'tr' ? 'İki Faktörlü Doğrulama (2FA)' : language === 'az' ? 'İki Faktorlu Təsdiqləmə (2FA)' : 'Two-Factor Authentication (2FA)'}</h2>
          <p className="text-xs text-slate-500">
            {status === "enabled" 
              ? (language === 'tr' ? '2FA aktif — hesabınız ekstra korumalı' : language === 'az' ? '2FA aktivdir — hesabınız əlavə qorunur' : '2FA is active — your account is extra secure')
              : (language === 'tr' ? 'Hesabınızı kimlik doğrulama uygulamasıyla koruyun' : language === 'az' ? 'Hesabınızı eyniləşdirmə tətbiqi ilə qoruyun' : 'Protect your account with an authenticator app')}
          </p>
        </div>
        <div className="ml-auto">
          {status === "enabled" 
            ? <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full border border-emerald-200">{language === 'tr' ? 'Aktif ✓' : language === 'az' ? 'Aktiv ✓' : 'Active ✓'}</span>
            : <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-black rounded-full border border-slate-200">{language === 'tr' ? 'Pasif' : language === 'az' ? 'Deaktiv' : 'Disabled'}</span>}
        </div>
      </div>

      {status === "enabled" && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p className="text-sm text-amber-700 font-bold mb-3">
            {language === 'tr' ? "2FA'yı devre dışı bırakmak için uygulamadaki 6 haneli kodu girin:" : language === 'az' ? "2FA-nı deaktiv etmək üçün tətbiqdəki 6 rəqəmli kodu daxil edin:" : "Enter the 6-digit code from the app to disable 2FA:"}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={token}
              onChange={e => setToken(e.target.value.replace(/\D/g, ""))}
              className="w-32 px-3 py-2 border border-amber-200 rounded-xl text-center font-mono font-black text-slate-800 bg-white focus:outline-none focus:border-amber-400 text-lg tracking-widest"
            />
            <button onClick={disable2FA} disabled={saving} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-colors">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />}
              {language === 'tr' ? 'Devre Dışı Bırak' : language === 'az' ? 'Deaktiv Et' : 'Disable'}
            </button>
          </div>
          {msg && <p className="mt-2 text-xs text-rose-600 font-bold">{msg}</p>}
        </div>
      )}

      {status === "disabled" && (
        <button onClick={startSetup} className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-sm transition-colors">
          <QrCode className="h-4 w-4" />
          {language === 'tr' ? '2FA Kurulumunu Başlat' : language === 'az' ? '2FA Quraşdırılmasına Başla' : 'Start 2FA Setup'}
        </button>
      )}

      {status === "setup" && qrDataUrl && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 font-medium">
            {language === 'tr' ? 'Google Authenticator, Authy veya benzeri bir uygulama ile aşağıdaki QR kodu tarayın:' : language === 'az' ? 'Google Authenticator, Authy və ya oxşar tətbiqlə aşağıdakı QR kodu skan edin:' : 'Scan the QR code below using Google Authenticator, Authy, or a similar app:'}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="border-4 border-teal-100 rounded-2xl p-2 bg-white shadow-md">
              <img src={qrDataUrl} alt="QR Code" className="w-40 h-40" />
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-xs text-slate-500 font-medium">{language === 'tr' ? 'Manuel giriş için gizli anahtar:' : language === 'az' ? 'Mexaniki daxiletmə üçün gizli açar:' : 'Secret key for manual entry:'}</p>
              <code className="block bg-slate-100 text-slate-800 text-xs font-mono px-3 py-2 rounded-xl break-all border border-slate-200">{secret}</code>
              <div className="space-y-2 pt-2">
                <p className="text-sm text-slate-700 font-bold">{language === 'tr' ? 'Uygulamadan 6 haneli kodu girin:' : language === 'az' ? 'Tətbiqdən 6 rəqəmli kodu daxil edin:' : 'Enter the 6-digit code from the app:'}</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={token}
                    onChange={e => setToken(e.target.value.replace(/\D/g, ""))}
                    className="w-32 px-3 py-2 border border-teal-200 rounded-xl text-center font-mono font-black text-slate-800 bg-white focus:outline-none focus:border-teal-400 text-lg tracking-widest"
                  />
                  <button onClick={enable2FA} disabled={saving} className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-colors">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {language === 'tr' ? 'Doğrula & Etkinleştir' : language === 'az' ? 'Təsdiqlə və Aktiv Et' : 'Verify & Enable'}
                  </button>
                </div>
                {msg && <p className="text-xs text-rose-600 font-bold">{msg}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}