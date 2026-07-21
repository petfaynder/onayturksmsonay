"use client";

import { useState } from 'react';
import { 
  Save, Loader2, CheckCircle2, Shield, CreditCard, ShoppingBag, Bitcoin, 
  ToggleLeft, ToggleRight, ShieldCheck, Globe, MessageSquare, Mail, 
  Settings, Search, Coins, Code, Eye, EyeOff, BookOpen 
} from 'lucide-react';

export default function SettingsForm({ 
  provider5sim, 
  providerHerosms, 
  initialSettings 
}: { 
  provider5sim: any, 
  providerHerosms: any, 
  initialSettings: Record<string, string> 
}) {
  const [activeTab, setActiveTab] = useState('brand');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  // 5sim Settings
  const [apiKey5sim, setApiKey5sim] = useState(provider5sim.apiKey);
  const [isActive5sim, setIsActive5sim] = useState(provider5sim.isActive);

  // HeroSMS Settings
  const [apiKeyHerosms, setApiKeyHerosms] = useState(providerHerosms.apiKey);
  const [isActiveHerosms, setIsActiveHerosms] = useState(providerHerosms.isActive);
  
  // Dynamic SaaS Settings
  const [settings, setSettings] = useState({
    // Brand & General
    SITE_NAME: initialSettings['SITE_NAME'] || 'OnayTR',
    SITE_URL: initialSettings['SITE_URL'] || 'http://localhost:3000',
    CONTACT_EMAIL: initialSettings['CONTACT_EMAIL'] || 'support@onaytr.com',
    SUPPORT_WHATSAPP: initialSettings['SUPPORT_WHATSAPP'] || '',
    SUPPORT_TELEGRAM: initialSettings['SUPPORT_TELEGRAM'] || '',

    // Sistem Bakım & Bildirim Ayarları
    MAINTENANCE_MODE_ACTIVE: initialSettings['MAINTENANCE_MODE_ACTIVE'] || 'false',
    MAINTENANCE_MODE_MESSAGE: initialSettings['MAINTENANCE_MODE_MESSAGE'] || 'Sitemiz güncelleme çalışması nedeniyle geçici olarak kapatılmıştır.',
    DISCORD_WEBHOOK_URL: initialSettings['DISCORD_WEBHOOK_URL'] || '',
    SLACK_WEBHOOK_URL: initialSettings['SLACK_WEBHOOK_URL'] || '',

    // SMS Providers & Margins (moved from old general)
    GLOBAL_MARGIN: initialSettings['GLOBAL_MARGIN'] || '50',
    USD_FALLBACK_RATE: initialSettings['USD_FALLBACK_RATE'] || '50.0',
    FORCE_PROVIDER: initialSettings['FORCE_PROVIDER'] || 'auto',

    // PayTR
    PAYTR_MERCHANT_ID: initialSettings['PAYTR_MERCHANT_ID'] || '',
    PAYTR_MERCHANT_KEY: initialSettings['PAYTR_MERCHANT_KEY'] || '',
    PAYTR_MERCHANT_SALT: initialSettings['PAYTR_MERCHANT_SALT'] || '',
    PAYTR_TEST_MODE: initialSettings['PAYTR_TEST_MODE'] || '0',
    
    // Shopier
    SHOPIER_API_KEY: initialSettings['SHOPIER_API_KEY'] || '',
    SHOPIER_API_SECRET: initialSettings['SHOPIER_API_SECRET'] || '',
    
    // Oxapay
    OXAPAY_MERCHANT_KEY: initialSettings['OXAPAY_MERCHANT_KEY'] || '',

    // SEO Settings
    SEO_META_TITLE: initialSettings['SEO_META_TITLE'] || 'OnayTR - Numara Onay Sistemi',
    SEO_META_DESCRIPTION: initialSettings['SEO_META_DESCRIPTION'] || 'Hızlı, Güvenilir ve Uygun Fiyatlı Numara Onay Servisi',
    SEO_META_KEYWORDS: initialSettings['SEO_META_KEYWORDS'] || 'sms onay, numara onay, mobil onay, fake numara',
    SEO_ROBOTS: initialSettings['SEO_ROBOTS'] || 'index, follow',
    GOOGLE_VERIFICATION_ID: initialSettings['GOOGLE_VERIFICATION_ID'] || '',
    GOOGLE_ANALYTICS_ID: initialSettings['GOOGLE_ANALYTICS_ID'] || '',

    // SaaS & Financial Settings
    CURRENCY_CODE: initialSettings['CURRENCY_CODE'] || 'TRY',
    CURRENCY_SYMBOL: initialSettings['CURRENCY_SYMBOL'] || '₺',
    MIN_DEPOSIT_LIMIT: initialSettings['MIN_DEPOSIT_LIMIT'] || '10',
    REFERRAL_PERCENT: initialSettings['REFERRAL_PERCENT'] || '5',
    SIGNUP_BONUS_BALANCE: initialSettings['SIGNUP_BONUS_BALANCE'] || '0',

    // API Rate Limits
    API_RATE_LIMIT_USER: initialSettings['API_RATE_LIMIT_USER'] || '60',
    API_RATE_LIMIT_RESELLER: initialSettings['API_RATE_LIMIT_RESELLER'] || '120',

    // Tier Discounts (% Discount off retail sell price)
    TIER_BRONZE_MARGIN: initialSettings['TIER_BRONZE_MARGIN'] || '0',
    TIER_SILVER_MARGIN: initialSettings['TIER_SILVER_MARGIN'] || '5',
    TIER_GOLD_MARGIN: initialSettings['TIER_GOLD_MARGIN'] || '10',
    TIER_RESELLER_MARGIN: initialSettings['TIER_RESELLER_MARGIN'] || '20',

    // Tier Upgrade Thresholds
    TIER_SILVER_SPEND: initialSettings['TIER_SILVER_SPEND'] || '1000',
    TIER_GOLD_SPEND: initialSettings['TIER_GOLD_SPEND'] || '5000',

    // SMTP Settings
    SMTP_HOST: initialSettings['SMTP_HOST'] || '',
    SMTP_PORT: initialSettings['SMTP_PORT'] || '',
    SMTP_USER: initialSettings['SMTP_USER'] || '',
    SMTP_PASSWORD: initialSettings['SMTP_PASSWORD'] || '',
    SMTP_ENCRYPTION: initialSettings['SMTP_ENCRYPTION'] || 'TLS',
    SMTP_FROM_EMAIL: initialSettings['SMTP_FROM_EMAIL'] || '',
    SMTP_FROM_NAME: initialSettings['SMTP_FROM_NAME'] || '',
    EMAIL_WELCOME_ACTIVE: initialSettings['EMAIL_WELCOME_ACTIVE'] || 'false',

    // Cloudflare Turnstile
    TURNSTILE_SITE_KEY: initialSettings['TURNSTILE_SITE_KEY'] || '',
    TURNSTILE_SECRET_KEY: initialSettings['TURNSTILE_SECRET_KEY'] || '',

    // Google OAuth
    GOOGLE_CLIENT_ID: initialSettings['GOOGLE_CLIENT_ID'] || '',
    GOOGLE_CLIENT_SECRET: initialSettings['GOOGLE_CLIENT_SECRET'] || '',

    // Password Security
    PASSWORD_STRENGTH_CHECK: initialSettings['PASSWORD_STRENGTH_CHECK'] || 'false',

    // Telegram
    TELEGRAM_BOT_TOKEN: initialSettings['TELEGRAM_BOT_TOKEN'] || '',
    TELEGRAM_BOT_USERNAME: initialSettings['TELEGRAM_BOT_USERNAME'] || '',

    // Integrations & Appearance
    SITE_LOGO_URL: initialSettings['SITE_LOGO_URL'] || '',
    SITE_FAVICON_URL: initialSettings['SITE_FAVICON_URL'] || '',
    CUSTOM_HEADER_SCRIPT: initialSettings['CUSTOM_HEADER_SCRIPT'] || '',
    CUSTOM_FOOTER_SCRIPT: initialSettings['CUSTOM_FOOTER_SCRIPT'] || '',

    // Localization
    DEFAULT_LANGUAGE: initialSettings['DEFAULT_LANGUAGE'] || 'tr',
    SUPPORTED_LANG_TR: initialSettings['SUPPORTED_LANG_TR'] || 'true',
    SUPPORTED_LANG_EN: initialSettings['SUPPORTED_LANG_EN'] || 'true',
    SUPPORTED_LANG_AZ: initialSettings['SUPPORTED_LANG_AZ'] || 'true',
    SYSTEM_TIMEZONE: initialSettings['SYSTEM_TIMEZONE'] || 'Europe/Istanbul',

    // Headless WordPress Blog Settings
    WORDPRESS_API_URL: initialSettings['WORDPRESS_API_URL'] || '',
    BLOG_TITLE: initialSettings['BLOG_TITLE'] || 'Blog',
    BLOG_DESCRIPTION: initialSettings['BLOG_DESCRIPTION'] || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);

    try {
      // 1. Update Provider 5sim
      const res1 = await fetch('/api/admin/settings/provider', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: provider5sim.id, apiKey: apiKey5sim, isActive: isActive5sim }),
      });

      // 2. Update Provider HeroSMS
      const res2 = await fetch('/api/admin/settings/provider', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: providerHerosms.id, apiKey: apiKeyHerosms, isActive: isActiveHerosms }),
      });

      // 3. Update System Settings
      const res3 = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (res1.ok && res2.ok && res3.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert("Güncelleme başarısız.");
      }
    } catch (err) {
      alert("Bağlantı hatası.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Tabs */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
        <button 
          type="button"
          onClick={() => setActiveTab('brand')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === 'brand' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 border' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Settings className="h-5 w-5" />
          Marka & Genel Ayarlar
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab('providers')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === 'providers' ? 'bg-teal-50 text-teal-700 border-teal-200 border' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Shield className="h-5 w-5" />
          SMS Sağlayıcı Ayarları
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === 'seo' ? 'bg-amber-50 text-amber-700 border-amber-200 border' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Search className="h-5 w-5" />
          SEO & Analytics
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === 'payments' ? 'bg-blue-50 text-blue-700 border-blue-200 border' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <CreditCard className="h-5 w-5" />
          Ödeme Entegrasyonları
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab('saas')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === 'saas' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 border' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Coins className="h-5 w-5" />
          Finans & Üyelik (SaaS)
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab('smtp')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === 'smtp' ? 'bg-violet-50 text-violet-700 border-violet-200 border' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Mail className="h-5 w-5" />
          SMTP E-posta Ayarları
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === 'security' ? 'bg-rose-50 text-rose-700 border-rose-200 border' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <ShieldCheck className="h-5 w-5" />
          Güvenlik & OAuth
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab('telegram')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === 'telegram' ? 'bg-sky-50 text-sky-700 border-sky-200 border' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <MessageSquare className="h-5 w-5" />
          Telegram Bildirimleri
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === 'integrations' ? 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 border' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <Code className="h-5 w-5" />
          Kod & Görünüm Entegrasyonları
        </button>

        <button 
          type="button"
          onClick={() => setActiveTab('blog')}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-colors ${activeTab === 'blog' ? 'bg-pink-50 text-pink-700 border-pink-200 border' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <BookOpen className="h-5 w-5" />
          Blog & WordPress Ayarları
        </button>
      </div>

      {/* Forms Content */}
      <div className="flex-1">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* BRAND & GENERAL */}
          {activeTab === 'brand' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-slate-800 display-font mb-6 border-b pb-2">Marka ve İletişim Ayarları</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Site Adı (Marka)</label>
                  <input 
                    type="text" 
                    value={settings.SITE_NAME}
                    onChange={(e) => handleSettingChange('SITE_NAME', e.target.value)}
                    placeholder="OnayTR"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">Logolarda ve sistem bildirimlerinde kullanılacak isim.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Site Adresi (URL)</label>
                  <input 
                    type="text" 
                    value={settings.SITE_URL}
                    onChange={(e) => handleSettingChange('SITE_URL', e.target.value)}
                    placeholder="https://onaytr.com"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">Sitenizin canonical adresi ve yönlendirmelerde kullanılacak kök dizin.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Destek/İletişim E-Postası</label>
                <input 
                  type="email" 
                  value={settings.CONTACT_EMAIL}
                  onChange={(e) => handleSettingChange('CONTACT_EMAIL', e.target.value)}
                  placeholder="support@onaytr.com"
                  className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                />
                <p className="text-xs text-slate-500 mt-2">İletişim sayfalarında gösterilecek resmi destek adresi.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp Destek Linki</label>
                  <input 
                    type="text" 
                    value={settings.SUPPORT_WHATSAPP}
                    onChange={(e) => handleSettingChange('SUPPORT_WHATSAPP', e.target.value)}
                    placeholder="https://wa.me/905555555555"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">WhatsApp iletişim butonu yönlendirme adresi.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Telegram Destek Linki</label>
                  <input 
                    type="text" 
                    value={settings.SUPPORT_TELEGRAM}
                    onChange={(e) => handleSettingChange('SUPPORT_TELEGRAM', e.target.value)}
                    placeholder="https://t.me/onaytrdestek"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">Telegram kanalı veya destek hesabı linki.</p>
                </div>
              </div>

              {/* Bakım Modu Card */}
              <div className="bg-white/40 border border-slate-100 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-extrabold text-indigo-800 text-sm uppercase tracking-wider">Sistem Bakım Modu</h3>
                  <button
                    type="button"
                    onClick={() => handleSettingChange('MAINTENANCE_MODE_ACTIVE', settings.MAINTENANCE_MODE_ACTIVE === 'true' ? 'false' : 'true')}
                    className="flex items-center gap-2 text-xs font-bold text-slate-600"
                  >
                    <span>Bakım Modu:</span>
                    {settings.MAINTENANCE_MODE_ACTIVE === 'true' ? (
                      <ToggleRight className="h-8 w-8 text-indigo-600" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-slate-400" />
                    )}
                  </button>
                </div>
                {settings.MAINTENANCE_MODE_ACTIVE === 'true' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Bakım Mesajı</label>
                    <textarea
                      value={settings.MAINTENANCE_MODE_MESSAGE}
                      onChange={(e) => handleSettingChange('MAINTENANCE_MODE_MESSAGE', e.target.value)}
                      placeholder="Sitemiz güncelleme çalışması nedeniyle geçici olarak kapatılmıştır."
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-400 rounded-lg text-slate-800 outline-none shadow-sm text-sm resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SMS PROVIDERS */}
          {activeTab === 'providers' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-slate-800 display-font mb-6 border-b pb-2">SMS API Sağlayıcı Ayarları</h2>
              
              {/* 5sim Settings Card */}
              <div className="bg-white/40 border border-slate-100 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-teal-800 text-sm uppercase tracking-wider">1. 5Sim Entegrasyonu</h3>
                  <button
                    type="button"
                    onClick={() => setIsActive5sim(!isActive5sim)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-600"
                  >
                    <span>Durum:</span>
                    {isActive5sim ? (
                      <ToggleRight className="h-8 w-8 text-teal-600" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-slate-400" />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 mb-2">5sim API Anahtarı (Bearer Token)</label>
                  <div className="relative">
                    <input 
                      type={showSecrets['5sim'] ? "text" : "password"} 
                      value={apiKey5sim}
                      onChange={(e) => setApiKey5sim(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      className="w-full pl-4 pr-12 py-2.5 bg-white border border-slate-200 focus:border-teal-450 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecret('5sim')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showSecrets['5sim'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* HeroSMS Settings Card */}
              <div className="bg-white/40 border border-slate-100 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-indigo-800 text-sm uppercase tracking-wider">2. HeroSMS Entegrasyonu</h3>
                  <button
                    type="button"
                    onClick={() => setIsActiveHerosms(!isActiveHerosms)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-600"
                  >
                    <span>Durum:</span>
                    {isActiveHerosms ? (
                      <ToggleRight className="h-8 w-8 text-indigo-600" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-slate-400" />
                    )}
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">HeroSMS API Key</label>
                  <div className="relative">
                    <input 
                      type={showSecrets['herosms'] ? "text" : "password"} 
                      value={apiKeyHerosms}
                      onChange={(e) => setApiKeyHerosms(e.target.value)}
                      placeholder="Geliştirici paneli API anahtarını girin..."
                      className="w-full pl-4 pr-12 py-2.5 bg-white border border-slate-200 focus:border-indigo-405 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecret('herosms')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showSecrets['herosms'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* System Pricing Variables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Varsayılan Kâr Oranı (%)</label>
                  <input 
                    type="number" 
                    value={settings.GLOBAL_MARGIN}
                    onChange={(e) => handleSettingChange('GLOBAL_MARGIN', e.target.value)}
                    placeholder="50"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-teal-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">Özel kâr oranı atanmamış tüm servislerin maliyetine uygulanacak genel marj oranı.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Varsayılan Dolar Kuru (TRY)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={settings.USD_FALLBACK_RATE}
                    onChange={(e) => handleSettingChange('USD_FALLBACK_RATE', e.target.value)}
                    placeholder="50.0"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-teal-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">Canlı döviz kuru çekilemediği zaman kullanılacak korumalı Dolar kuru.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Manuel Sağlayıcı Önceliği (Force Bypass)</label>
                <select 
                  value={settings.FORCE_PROVIDER}
                  onChange={(e) => handleSettingChange('FORCE_PROVIDER', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-teal-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                >
                  <option value="auto">Otomatik Akıllı Yönlendirme (En Yüksek Kâr - Önerilen)</option>
                  <option value="5sim">Tüm Trafiği 5Sim'e Yönlendir (HeroSMS Bypass)</option>
                  <option value="herosms">Tüm Trafiği HeroSMS'e Yönlendir (5Sim Bypass)</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">Bu ayar etkinleştirildiğinde kâr analiz motoru devre dışı bırakılır ve tüm satın alma/fiyatlandırma işlemleri zorla seçilen sağlayıcıya yönlendirilir.</p>
              </div>
            </div>
          )}

          {/* SEO & ANALYTICS */}
          {activeTab === 'seo' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-slate-800 display-font mb-6 border-b pb-2">SEO & Arama Motoru Ayarları</h2>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Anasayfa Meta Başlığı (Meta Title)</label>
                <input 
                  type="text" 
                  value={settings.SEO_META_TITLE}
                  onChange={(e) => handleSettingChange('SEO_META_TITLE', e.target.value)}
                  placeholder="OnayTR - Numara Onay Sistemi"
                  className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                />
                <p className="text-xs text-slate-500 mt-2">Arama motorlarında listelenen ana başlık.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Anasayfa Meta Açıklaması (Meta Description)</label>
                <textarea 
                  value={settings.SEO_META_DESCRIPTION}
                  onChange={(e) => handleSettingChange('SEO_META_DESCRIPTION', e.target.value)}
                  placeholder="Hızlı, Güvenilir ve Uygun Fiyatlı Numara Onay Servisi"
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm resize-none"
                />
                <p className="text-xs text-slate-500 mt-2">Arama motorlarında sitenin altında görünen 150-160 karakterlik özet metin.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Meta Anahtar Kelimeler (Keywords)</label>
                  <input 
                    type="text" 
                    value={settings.SEO_META_KEYWORDS}
                    onChange={(e) => handleSettingChange('SEO_META_KEYWORDS', e.target.value)}
                    placeholder="sms onay, numara onay, mobil onay, fake numara"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">Virgülle ayrılmış arama anahtar kelimeleri.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Arama Motoru Robot İndeksi (Robots Tag)</label>
                  <select 
                    value={settings.SEO_ROBOTS}
                    onChange={(e) => handleSettingChange('SEO_ROBOTS', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                  >
                    <option value="index, follow">Sitem Arama Motorlarında İndekslensin (index, follow - Önerilen)</option>
                    <option value="noindex, nofollow">Arama Motorlarından Gizlensin (noindex, nofollow)</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-2">Geliştirme aşamasındayken gizlemek için noindex yapabilirsiniz.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Google Search Console Kodu</label>
                  <input 
                    type="text" 
                    value={settings.GOOGLE_VERIFICATION_ID}
                    onChange={(e) => handleSettingChange('GOOGLE_VERIFICATION_ID', e.target.value)}
                    placeholder="google-site-verification-id"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-400 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-xs"
                  />
                  <p className="text-xs text-slate-500 mt-2">Google Webmaster araçları doğrulaması için HTML meta etiketi kodu.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Google Analytics GA4 Ölçüm Kimliği</label>
                  <input 
                    type="text" 
                    value={settings.GOOGLE_ANALYTICS_ID}
                    onChange={(e) => handleSettingChange('GOOGLE_ANALYTICS_ID', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-amber-400 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-xs"
                  />
                  <p className="text-xs text-slate-500 mt-2">Google Analytics 4 istatistik takip kimliği.</p>
                </div>
              </div>
            </div>
          )}

          {/* PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-slate-800 display-font mb-6 border-b pb-2">Ödeme Entegrasyonları</h2>
              
              {/* PayTR */}
              <div className="bg-white/40 border border-slate-100 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-extrabold text-blue-800 text-sm uppercase tracking-wider">PayTR Kredi Kartı Ödemesi</h3>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-600">Test Modu:</label>
                    <button
                      type="button"
                      onClick={() => handleSettingChange('PAYTR_TEST_MODE', settings.PAYTR_TEST_MODE === '1' ? '0' : '1')}
                      className="flex items-center gap-1"
                    >
                      {settings.PAYTR_TEST_MODE === '1' ? (
                        <ToggleRight className="h-8 w-8 text-blue-600" />
                      ) : (
                        <ToggleLeft className="h-8 w-8 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Merchant ID (Mağaza No)</label>
                    <input 
                      type="text" 
                      value={settings.PAYTR_MERCHANT_ID}
                      onChange={(e) => handleSettingChange('PAYTR_MERCHANT_ID', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-blue-400 rounded-lg text-slate-800 outline-none shadow-sm font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Merchant Key (Mağaza Parolası)</label>
                    <div className="relative">
                      <input 
                        type={showSecrets['paytr_key'] ? "text" : "password"} 
                        value={settings.PAYTR_MERCHANT_KEY}
                        onChange={(e) => handleSettingChange('PAYTR_MERCHANT_KEY', e.target.value)}
                        className="w-full pl-3 pr-10 py-2 bg-white border border-slate-200 focus:border-blue-400 rounded-lg text-slate-800 outline-none shadow-sm font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('paytr_key')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSecrets['paytr_key'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Merchant Salt (Gizli Anahtar)</label>
                    <div className="relative">
                      <input 
                        type={showSecrets['paytr_salt'] ? "text" : "password"} 
                        value={settings.PAYTR_MERCHANT_SALT}
                        onChange={(e) => handleSettingChange('PAYTR_MERCHANT_SALT', e.target.value)}
                        className="w-full pl-3 pr-10 py-2 bg-white border border-slate-200 focus:border-blue-400 rounded-lg text-slate-800 outline-none shadow-sm font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('paytr_salt')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSecrets['paytr_salt'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shopier */}
              <div className="bg-white/40 border border-slate-100 p-5 rounded-2xl space-y-4">
                <div className="border-b pb-2">
                  <h3 className="font-extrabold text-orange-800 text-sm uppercase tracking-wider">Shopier Dijital Ödeme</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Shopier API Key (Kullanıcı Adı)</label>
                    <input 
                      type="text" 
                      value={settings.SHOPIER_API_KEY}
                      onChange={(e) => handleSettingChange('SHOPIER_API_KEY', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-orange-400 rounded-lg text-slate-800 outline-none shadow-sm font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Shopier API Secret (API Şifresi)</label>
                    <div className="relative">
                      <input 
                        type={showSecrets['shopier'] ? "text" : "password"} 
                        value={settings.SHOPIER_API_SECRET}
                        onChange={(e) => handleSettingChange('SHOPIER_API_SECRET', e.target.value)}
                        className="w-full pl-3 pr-10 py-2 bg-white border border-slate-200 focus:border-orange-400 rounded-lg text-slate-800 outline-none shadow-sm font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('shopier')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSecrets['shopier'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Oxapay */}
              <div className="bg-white/40 border border-slate-100 p-5 rounded-2xl space-y-4">
                <div className="border-b pb-2">
                  <h3 className="font-extrabold text-indigo-800 text-sm uppercase tracking-wider">Oxapay Kripto Para</h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Oxapay Merchant API Key</label>
                  <div className="relative">
                    <input 
                      type={showSecrets['oxapay'] ? "text" : "password"} 
                      value={settings.OXAPAY_MERCHANT_KEY}
                      onChange={(e) => handleSettingChange('OXAPAY_MERCHANT_KEY', e.target.value)}
                      className="w-full pl-4 pr-12 py-2.5 bg-white border border-slate-200 focus:border-indigo-400 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecret('oxapay')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showSecrets['oxapay'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SAAS / FINANCIAL */}
          {activeTab === 'saas' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-slate-800 display-font mb-6 border-b pb-2">Finans ve SaaS Üyelik Ayarları</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Para Birimi Simgesi</label>
                  <input 
                    type="text" 
                    value={settings.CURRENCY_SYMBOL}
                    onChange={(e) => handleSettingChange('CURRENCY_SYMBOL', e.target.value)}
                    placeholder="₺"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-emerald-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">Fiyatlarda gösterilecek simge (örn: ₺, $, €).</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Para Birimi Kodu</label>
                  <input 
                    type="text" 
                    value={settings.CURRENCY_CODE}
                    onChange={(e) => handleSettingChange('CURRENCY_CODE', e.target.value)}
                    placeholder="TRY"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-emerald-400 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">Ödeme sağlayıcılarına gönderilecek 3 haneli ISO kodu (örn: TRY, USD, EUR).</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Minimum Yükleme Limiti</label>
                  <input 
                    type="number" 
                    value={settings.MIN_DEPOSIT_LIMIT}
                    onChange={(e) => handleSettingChange('MIN_DEPOSIT_LIMIT', e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-emerald-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">Üyenin tek seferde yükleyebileceği en düşük tutar.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Yeni Üye Kayıt Hediyesi</label>
                  <input 
                    type="number" 
                    value={settings.SIGNUP_BONUS_BALANCE}
                    onChange={(e) => handleSettingChange('SIGNUP_BONUS_BALANCE', e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-emerald-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">Kayıt olan her üyeye hediye edilecek başlangıç bakiyesi.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Referans Komisyonu (%)</label>
                  <input 
                    type="number" 
                    value={settings.REFERRAL_PERCENT}
                    onChange={(e) => handleSettingChange('REFERRAL_PERCENT', e.target.value)}
                    placeholder="5"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-emerald-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">Davet eden üyenin yapılan siparişlerden alacağı komisyon oranı.</p>
                </div>
              </div>

              {/* API Hız Limitleri */}
              <div className="bg-white/40 border border-slate-100 p-5 rounded-2xl space-y-4 pt-4 mt-6">
                <h3 className="font-extrabold text-emerald-800 text-sm uppercase tracking-wider border-b pb-2">API Hız Limitleri (Dakika Başına İstek)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Normal Kullanıcı Sınırı</label>
                    <input 
                      type="number" 
                      value={settings.API_RATE_LIMIT_USER}
                      onChange={(e) => handleSettingChange('API_RATE_LIMIT_USER', e.target.value)}
                      placeholder="60"
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-emerald-450 rounded-lg text-slate-800 outline-none shadow-sm text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Bayi (Reseller) Sınırı</label>
                    <input 
                      type="number" 
                      value={settings.API_RATE_LIMIT_RESELLER}
                      onChange={(e) => handleSettingChange('API_RATE_LIMIT_RESELLER', e.target.value)}
                      placeholder="120"
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-emerald-450 rounded-lg text-slate-800 outline-none shadow-sm text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Üye Seviyeleri ve İndirim Oranları */}
              <div className="bg-white/40 border border-slate-100 p-5 rounded-2xl space-y-4 pt-4 mt-6">
                <h3 className="font-extrabold text-emerald-800 text-sm uppercase tracking-wider border-b pb-2">Kullanıcı Kademe (Tier) İndirim Yüzdeleri</h3>
                <p className="text-xs text-slate-500 font-medium">Servislerin kârlı satış fiyatı üzerinden kademelere özel uygulanacak indirim yüzdesidir (Örn: Servis %200 kârlı fiyattayken %5 veya %10 indirim uygulanır).</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Bronze İndirimi (%)</label>
                    <input 
                      type="number" 
                      value={settings.TIER_BRONZE_MARGIN}
                      onChange={(e) => handleSettingChange('TIER_BRONZE_MARGIN', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-emerald-450 rounded-lg text-slate-800 outline-none shadow-sm text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Silver İndirimi (%)</label>
                    <input 
                      type="number" 
                      value={settings.TIER_SILVER_MARGIN}
                      onChange={(e) => handleSettingChange('TIER_SILVER_MARGIN', e.target.value)}
                      placeholder="5"
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-emerald-450 rounded-lg text-slate-800 outline-none shadow-sm text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Gold İndirimi (%)</label>
                    <input 
                      type="number" 
                      value={settings.TIER_GOLD_MARGIN}
                      onChange={(e) => handleSettingChange('TIER_GOLD_MARGIN', e.target.value)}
                      placeholder="10"
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-emerald-450 rounded-lg text-slate-800 outline-none shadow-sm text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Reseller İndirimi (%)</label>
                    <input 
                      type="number" 
                      value={settings.TIER_RESELLER_MARGIN}
                      onChange={(e) => handleSettingChange('TIER_RESELLER_MARGIN', e.target.value)}
                      placeholder="20"
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-emerald-450 rounded-lg text-slate-800 outline-none shadow-sm text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Otomatik Tier Geçiş Eşikleri */}
              <div className="bg-white/40 border border-slate-100 p-5 rounded-2xl space-y-4 pt-4 mt-6">
                <h3 className="font-extrabold text-emerald-800 text-sm uppercase tracking-wider border-b pb-2">Otomatik Kademe Harcama Eşikleri (Aylık Ciro)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Silver Seviye Eşiği (TL)</label>
                    <input 
                      type="number" 
                      value={settings.TIER_SILVER_SPEND}
                      onChange={(e) => handleSettingChange('TIER_SILVER_SPEND', e.target.value)}
                      placeholder="1000"
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-emerald-450 rounded-lg text-slate-800 outline-none shadow-sm text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Gold Seviye Eşiği (TL)</label>
                    <input 
                      type="number" 
                      value={settings.TIER_GOLD_SPEND}
                      onChange={(e) => handleSettingChange('TIER_GOLD_SPEND', e.target.value)}
                      placeholder="5000"
                      className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-emerald-450 rounded-lg text-slate-800 outline-none shadow-sm text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SMTP EMAIL */}
          {activeTab === 'smtp' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-slate-800 display-font mb-6 border-b pb-2">SMTP E-posta Gönderim Ayarları</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">SMTP Sunucusu (Host)</label>
                  <input 
                    type="text" 
                    value={settings.SMTP_HOST}
                    onChange={(e) => handleSettingChange('SMTP_HOST', e.target.value)}
                    placeholder="mail.siteniz.com veya smtp.gmail.com"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-violet-400 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">SMTP Portu</label>
                  <input 
                    type="number" 
                    value={settings.SMTP_PORT}
                    onChange={(e) => handleSettingChange('SMTP_PORT', e.target.value)}
                    placeholder="587"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-violet-400 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">SMTP Kullanıcı Adı (Email)</label>
                  <input 
                    type="text" 
                    value={settings.SMTP_USER}
                    onChange={(e) => handleSettingChange('SMTP_USER', e.target.value)}
                    placeholder="info@siteniz.com"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-violet-400 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">SMTP Şifresi</label>
                  <div className="relative">
                    <input 
                      type={showSecrets['smtp'] ? "text" : "password"} 
                      value={settings.SMTP_PASSWORD}
                      onChange={(e) => handleSettingChange('SMTP_PASSWORD', e.target.value)}
                      placeholder="••••••••••••••"
                      className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 focus:border-violet-400 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSecret('smtp')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showSecrets['smtp'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">SMTP Şifreleme Türü</label>
                  <select 
                    value={settings.SMTP_ENCRYPTION}
                    onChange={(e) => handleSettingChange('SMTP_ENCRYPTION', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-violet-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                  >
                    <option value="TLS">TLS (587 - Önerilen)</option>
                    <option value="SSL">SSL (465)</option>
                    <option value="NONE">Şifreleme Yok (25)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Karşılama E-postası Gönder</label>
                  <div className="flex items-center h-[52px]">
                    <button
                      type="button"
                      onClick={() => handleSettingChange('EMAIL_WELCOME_ACTIVE', settings.EMAIL_WELCOME_ACTIVE === 'true' ? 'false' : 'true')}
                      className="flex items-center gap-2 text-sm font-bold text-slate-650"
                    >
                      <span>Yeni üyeye hoş geldiniz maili gitsin mi?</span>
                      {settings.EMAIL_WELCOME_ACTIVE === 'true' ? (
                        <ToggleRight className="h-8 w-8 text-violet-600" />
                      ) : (
                        <ToggleLeft className="h-8 w-8 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Gönderen E-posta Adresi (From Email)</label>
                  <input 
                    type="email" 
                    value={settings.SMTP_FROM_EMAIL}
                    onChange={(e) => handleSettingChange('SMTP_FROM_EMAIL', e.target.value)}
                    placeholder="noreply@siteniz.com"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-violet-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Gönderen Adı (From Name)</label>
                  <input 
                    type="text" 
                    value={settings.SMTP_FROM_NAME}
                    onChange={(e) => handleSettingChange('SMTP_FROM_NAME', e.target.value)}
                    placeholder="OnayTR Destek"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-violet-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECURITY & OAUTH */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-slate-800 display-font mb-6 border-b pb-2">Güvenlik & OAuth Ayarları</h2>
              
              {/* Cloudflare Turnstile */}
              <div className="bg-white/40 border border-slate-100 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-rose-600" />
                  <h3 className="font-extrabold text-rose-800 text-sm uppercase tracking-wider">Cloudflare Turnstile (Bot Koruması)</h3>
                </div>
                <p className="text-xs text-slate-500">Giriş yap ve kayıt ol sayfalarında bot koruması sağlar. Cloudflare Dashboard üzerinden key alabilirsiniz.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Site Key (Public)</label>
                    <input 
                      type="text" 
                      value={settings.TURNSTILE_SITE_KEY}
                      onChange={(e) => handleSettingChange('TURNSTILE_SITE_KEY', e.target.value)}
                      placeholder="0x4AAAA..."
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-rose-400 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Secret Key (Server)</label>
                    <div className="relative">
                      <input 
                        type={showSecrets['turnstile'] ? "text" : "password"} 
                        value={settings.TURNSTILE_SECRET_KEY}
                        onChange={(e) => handleSettingChange('TURNSTILE_SECRET_KEY', e.target.value)}
                        placeholder="0x4AAAA..."
                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 focus:border-rose-400 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('turnstile')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSecrets['turnstile'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-amber-600 font-bold">⚠ Boş bırakılırsa Turnstile doğrulaması devre dışı kalır.</p>
              </div>

              {/* Google OAuth */}
              <div className="bg-white/40 border border-slate-100 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <h3 className="font-extrabold text-blue-800 text-sm uppercase tracking-wider">Google OAuth (Google ile Giriş)</h3>
                </div>
                <p className="text-xs text-slate-500">Google Cloud Console üzerinden Client ID oluşturun.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Google Client ID</label>
                    <input 
                      type="text" 
                      value={settings.GOOGLE_CLIENT_ID}
                      onChange={(e) => handleSettingChange('GOOGLE_CLIENT_ID', e.target.value)}
                      placeholder="123456789.apps.googleusercontent.com"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-blue-400 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Google Client Secret</label>
                    <div className="relative">
                      <input 
                        type={showSecrets['google'] ? "text" : "password"} 
                        value={settings.GOOGLE_CLIENT_SECRET}
                        onChange={(e) => handleSettingChange('GOOGLE_CLIENT_SECRET', e.target.value)}
                        placeholder="GOCSPX-..."
                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 focus:border-blue-400 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('google')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSecrets['google'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-amber-600 font-bold">⚠ Boş bırakılırsa Google ile giriş butonu aktifleşmez.</p>
              </div>

              {/* Şifre Politikası */}
              <div className="bg-white/40 border border-slate-100 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-rose-800 text-sm uppercase tracking-wider">Güçlü Şifre Zorunluluğu</h3>
                    <p className="text-xs text-slate-500 mt-1">Kayıt esnasında şifrenin en az 8 karakter, 1 büyük harf, 1 rakam ve 1 özel karakter içermesini zorunlu kılar.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSettingChange('PASSWORD_STRENGTH_CHECK', settings.PASSWORD_STRENGTH_CHECK === 'true' ? 'false' : 'true')}
                    className="flex items-center gap-2"
                  >
                    {settings.PASSWORD_STRENGTH_CHECK === 'true' ? (
                      <ToggleRight className="h-8 w-8 text-rose-600" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TELEGRAM */}
          {activeTab === 'telegram' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-slate-800 display-font mb-6 border-b pb-2">Telegram Bot Ayarları</h2>
              
              <div className="bg-sky-50/60 border border-sky-100 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-sky-600" />
                  <h3 className="font-extrabold text-sky-800 text-sm uppercase tracking-wider">Telegram Bot Entegrasyonu</h3>
                </div>
                <p className="text-xs text-slate-650">
                  Telegram Bot oluşturmak için @BotFather'a gidin. Alınan Token ve Username bilgilerini girin.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Bot Token</label>
                    <div className="relative">
                      <input 
                        type={showSecrets['telegram'] ? "text" : "password"} 
                        value={settings.TELEGRAM_BOT_TOKEN}
                        onChange={(e) => handleSettingChange('TELEGRAM_BOT_TOKEN', e.target.value)}
                        placeholder="1234567890:AAF..."
                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 focus:border-sky-400 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('telegram')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSecrets['telegram'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Bot Kullanıcı Adı (Username)</label>
                    <input 
                      type="text" 
                      value={settings.TELEGRAM_BOT_USERNAME}
                      onChange={(e) => handleSettingChange('TELEGRAM_BOT_USERNAME', e.target.value)}
                      placeholder="@OnayTRBot"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-sky-400 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-xs"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-amber-600 font-bold">⚠ Bot token girilmeden Telegram bildirimleri çalışmaz.</p>
              </div>
            </div>
          )}

          {/* INTEGRATIONS & APPEARANCE */}
          {activeTab === 'integrations' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-slate-800 display-font mb-6 border-b pb-2">Kod & Görünüm Entegrasyonları</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Site Logo URL'si</label>
                  <input 
                    type="text" 
                    value={settings.SITE_LOGO_URL}
                    onChange={(e) => handleSettingChange('SITE_LOGO_URL', e.target.value)}
                    placeholder="https://siteniz.com/images/logo.png"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-fuchsia-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">Varsayılan vektör/metin logosu yerine yüklemek istediğiniz görsel linki.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Site Favicon URL'si</label>
                  <input 
                    type="text" 
                    value={settings.SITE_FAVICON_URL}
                    onChange={(e) => handleSettingChange('SITE_FAVICON_URL', e.target.value)}
                    placeholder="https://siteniz.com/favicon.ico"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-fuchsia-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">Tarayıcı sekmesinde görünen site ikonu linki.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Özel Head HTML Kodları (Header Custom Scripts)</label>
                <textarea 
                  value={settings.CUSTOM_HEADER_SCRIPT}
                  onChange={(e) => handleSettingChange('CUSTOM_HEADER_SCRIPT', e.target.value)}
                  placeholder="<!-- Tawk.to, Facebook Pixel, Google Tag Manager scriptlerinizi buraya yapıştırın -->"
                  rows={6}
                  className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-fuchsia-400 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-xs resize-y"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Sitenizin <code>&lt;head&gt;</code> etiketinin en sonuna enjekte edilecek HTML script kodları.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Özel Footer HTML Kodları (Footer Custom Scripts)</label>
                <textarea 
                  value={settings.CUSTOM_FOOTER_SCRIPT}
                  onChange={(e) => handleSettingChange('CUSTOM_FOOTER_SCRIPT', e.target.value)}
                  placeholder="<!-- Canlı destek widget kodları veya body sonu scriptleri buraya yapıştırın -->"
                  rows={6}
                  className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-fuchsia-400 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-xs resize-y"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Sitenizin <code>&lt;/body&gt;</code> kapanış etiketinden hemen önce enjekte edilecek HTML script kodları.
                </p>
              </div>

              {/* Webhook Entegrasyonları */}
              <div className="bg-white/40 border border-slate-100 p-5 rounded-2xl space-y-4 mt-6">
                <h3 className="font-extrabold text-fuchsia-800 text-sm uppercase tracking-wider border-b pb-2">Admin Kritik Olay Webhook Bildirimleri</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Discord Webhook URL</label>
                    <input 
                      type="text" 
                      value={settings.DISCORD_WEBHOOK_URL}
                      onChange={(e) => handleSettingChange('DISCORD_WEBHOOK_URL', e.target.value)}
                      placeholder="https://discord.com/api/webhooks/..."
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-fuchsia-405 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Slack Webhook URL</label>
                    <input 
                      type="text" 
                      value={settings.SLACK_WEBHOOK_URL}
                      onChange={(e) => handleSettingChange('SLACK_WEBHOOK_URL', e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-fuchsia-405 rounded-xl text-slate-800 outline-none shadow-sm font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Lokalizasyon & Diller */}
              <div className="bg-white/40 border border-slate-100 p-5 rounded-2xl space-y-4 mt-6">
                <h3 className="font-extrabold text-fuchsia-800 text-sm uppercase tracking-wider border-b pb-2">Lokalizasyon, Diller & Zaman Dilimi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Varsayılan Dil</label>
                    <select 
                      value={settings.DEFAULT_LANGUAGE}
                      onChange={(e) => handleSettingChange('DEFAULT_LANGUAGE', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-fuchsia-405 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                    >
                      <option value="tr">Türkçe (tr)</option>
                      <option value="en">English (en)</option>
                      <option value="az">Azerbaycan dili (az)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Sistem Zaman Dilimi (Timezone)</label>
                    <select 
                      value={settings.SYSTEM_TIMEZONE}
                      onChange={(e) => handleSettingChange('SYSTEM_TIMEZONE', e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-fuchsia-405 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                    >
                      <option value="Europe/Istanbul">İstanbul (Europe/Istanbul - GMT+3)</option>
                      <option value="Europe/Baku">Bakü (Europe/Baku - GMT+4)</option>
                      <option value="UTC">Coordinated Universal Time (UTC)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700">Aktif Dil Seçenekleri</label>
                  <div className="flex flex-wrap gap-6 items-center">
                    <button
                      type="button"
                      onClick={() => handleSettingChange('SUPPORTED_LANG_TR', settings.SUPPORTED_LANG_TR === 'true' ? 'false' : 'true')}
                      className="flex items-center gap-2 text-xs font-bold text-slate-600"
                    >
                      {settings.SUPPORTED_LANG_TR === 'true' ? (
                        <ToggleRight className="h-6 w-6 text-fuchsia-600" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-slate-400" />
                      )}
                      <span>Türkçe Aktif</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSettingChange('SUPPORTED_LANG_EN', settings.SUPPORTED_LANG_EN === 'true' ? 'false' : 'true')}
                      className="flex items-center gap-2 text-xs font-bold text-slate-600"
                    >
                      {settings.SUPPORTED_LANG_EN === 'true' ? (
                        <ToggleRight className="h-6 w-6 text-fuchsia-600" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-slate-400" />
                      )}
                      <span>İngilizce Aktif</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSettingChange('SUPPORTED_LANG_AZ', settings.SUPPORTED_LANG_AZ === 'true' ? 'false' : 'true')}
                      className="flex items-center gap-2 text-xs font-bold text-slate-600"
                    >
                      {settings.SUPPORTED_LANG_AZ === 'true' ? (
                        <ToggleRight className="h-6 w-6 text-fuchsia-600" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-slate-400" />
                      )}
                      <span>Azerice Aktif</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BLOG & WORDPRESS SETTINGS */}
          {activeTab === 'blog' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-black text-slate-800 display-font mb-6 border-b pb-2">Blog & Headless WordPress Ayarları</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">WordPress REST API / Site Adresi</label>
                  <input 
                    type="text" 
                    value={settings.WORDPRESS_API_URL}
                    onChange={(e) => handleSettingChange('WORDPRESS_API_URL', e.target.value)}
                    placeholder="https://blog.onaytr.com"
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-pink-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Okara.ai platformunun otomatik yazıları yayınladığı WordPress sitenizin kök adresidir. 
                    (Örn: <code>https://blog.onaytr.com</code>). REST API endpoint'leri bu adres üzerinden (<code>/wp-json/wp/v2/...</code>) otomatik sorgulanacaktır.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Blog Başlığı (Title)</label>
                    <input 
                      type="text" 
                      value={settings.BLOG_TITLE}
                      onChange={(e) => handleSettingChange('BLOG_TITLE', e.target.value)}
                      placeholder="OnayTR Blog"
                      className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-pink-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                    />
                    <p className="text-xs text-slate-500 mt-2">Blog sayfasında görünecek ana başlık.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Blog Açıklaması (Description)</label>
                    <input 
                      type="text" 
                      value={settings.BLOG_DESCRIPTION}
                      onChange={(e) => handleSettingChange('BLOG_DESCRIPTION', e.target.value)}
                      placeholder="Sanal numara onay, SMS onay servisleri hakkında güncel rehberler."
                      className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-pink-400 rounded-xl text-slate-800 outline-none shadow-sm text-sm"
                    />
                    <p className="text-xs text-slate-500 mt-2">Blog sayfasının alt başlığı ve SEO açıklama metni.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-6 border-t mt-8">
            <button 
              type="submit"
              disabled={isSaving}
              className="px-8 py-3.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-600 text-white rounded-xl shadow-md transition-all flex items-center gap-2 font-bold text-[15px]"
            >
              {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : success ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Save className="h-5 w-5" />}
              Tüm Ayarları Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
