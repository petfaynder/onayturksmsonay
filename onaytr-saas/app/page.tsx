"use client";

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import {
  Rocket, Play, ShieldAlert, Globe, Clock, MessageSquare, Send, Check, Plus,
  Sparkles, ShieldCheck, Heart, Calendar, FileText, Search, Settings, 
  ExternalLink, Lock, FileCheck, History, ChevronDown, BookOpen, Key,
  ArrowRight, Activity, ChevronRight, PlayCircle, RefreshCw
} from 'lucide-react';
import AppLogo from '@/components/AppLogo';
import { useLanguage } from '@/components/LanguageProvider';

// ─── Static pricing/faq data (translated inside component) ──────────────────
const PRICING_DATA = [
  { countryKey: 'lp_country_us', code: '+1', flagClass: 'fi-us', label: 'USA', service: 'WhatsApp Business', rateKey: 'lp_rate_very_high', rateClass: 'bg-green-100 text-green-700', rateDot: 'bg-green-500', price: '12.50 TL', sparkData: [40, 50, 45, 60, 55, 80, 99] },
  { countryKey: 'lp_country_gb', code: '+44', flagClass: 'fi-gb', label: 'UK', service: 'Telegram Global', rateKey: 'lp_rate_high', rateClass: 'bg-green-100 text-green-700', rateDot: 'bg-green-500', price: '8.25 TL', sparkData: [30, 40, 35, 50, 60, 75, 90] },
  { countryKey: 'lp_country_de', code: '+49', flagClass: 'fi-de', label: 'GER', service: 'Instagram & Threads', rateKey: 'lp_rate_stable', rateClass: 'bg-blue-100 text-blue-700', rateDot: 'bg-blue-500', price: '4.50 TL', sparkData: [50, 45, 50, 55, 50, 60, 65] },
  { countryKey: 'lp_country_tr', code: '+90', flagClass: 'fi-tr', label: 'TR', service: 'Google / Gmail', rateKey: 'lp_rate_very_high', rateClass: 'bg-green-100 text-green-700', rateDot: 'bg-green-500', price: '15.00 TL', sparkData: [60, 70, 65, 80, 75, 95, 98] },
  { countryKey: 'lp_country_ru', code: '+7', flagClass: 'fi-ru', label: 'RUS', service: 'WhatsApp Business', rateKey: 'lp_rate_high', rateClass: 'bg-green-100 text-green-700', rateDot: 'bg-green-500', price: '9.80 TL', sparkData: [40, 35, 50, 60, 55, 75, 88] },
  { countryKey: 'lp_country_fr', code: '+33', flagClass: 'fi-fr', label: 'FRA', service: 'Telegram Global', rateKey: 'lp_rate_stable', rateClass: 'bg-blue-100 text-blue-700', rateDot: 'bg-blue-500', price: '6.40 TL', sparkData: [35, 45, 40, 50, 45, 60, 68] },
  { countryKey: 'lp_country_az', code: '+994', flagClass: 'fi-az', label: 'AZE', service: 'Google / Gmail', rateKey: 'lp_rate_high', rateClass: 'bg-green-100 text-green-700', rateDot: 'bg-green-500', price: '7.50 TL', sparkData: [45, 50, 48, 60, 58, 70, 85] },
  { countryKey: 'lp_country_pl', code: '+48', flagClass: 'fi-pl', label: 'POL', service: 'Instagram & Threads', rateKey: 'lp_rate_stable', rateClass: 'bg-blue-100 text-blue-700', rateDot: 'bg-blue-500', price: '5.20 TL', sparkData: [30, 40, 38, 45, 42, 55, 62] }
];

const CAROUSEL_DATA = [
  { flag: 'fi-us', nameKey: 'lp_cc_us', price: '₺12.50' },
  { flag: 'fi-gb', nameKey: 'lp_cc_gb', price: '₺8.25' },
  { flag: 'fi-de', nameKey: 'lp_cc_de', price: '₺4.50' },
  { flag: 'fi-tr', nameKey: 'lp_cc_tr', price: '₺15.00' },
  { flag: 'fi-ru', nameKey: 'lp_cc_ru', price: '₺9.80' },
  { flag: 'fi-fr', nameKey: 'lp_cc_fr', price: '₺6.40' },
  { flag: 'fi-az', nameKey: 'lp_cc_az', price: '₺7.50' },
  { flag: 'fi-pl', nameKey: 'lp_cc_pl', price: '₺5.20' },
  { flag: 'fi-nl', nameKey: 'lp_cc_nl', price: '₺8.90' },
  { flag: 'fi-ca', nameKey: 'lp_cc_ca', price: '₺11.20' },
];

// FAQs are translated inside the component using faqKeys
const FAQ_KEYS = [
  { qKey: 'lp_faq_q1', aKey: 'lp_faq_a1' },
  { qKey: 'lp_faq_q2', aKey: 'lp_faq_a2' },
  { qKey: 'lp_faq_q3', aKey: 'lp_faq_a3' },
  { qKey: 'lp_faq_q4', aKey: 'lp_faq_a4' },
];

const CODE_EXAMPLES = {
  python: `import requests

api_key = "ONAY_TR_XXXXXX"
payload = {
    "service": "whatsapp",
    "country": "1"
}

response = requests.post(
    "https://api.onaytr.com/v2/order",
    json=payload,
    headers={"Authorization": api_key}
)

print(response.json())`,
  node: `const axios = require('axios');

const apiKey = 'ONAY_TR_XXXXXX';
const payload = {
  service: 'whatsapp',
  country: '1'
};

axios.post('https://api.onaytr.com/v2/order', payload, {
  headers: { 'Authorization': apiKey }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));`,
  php: `<?php
$apiKey = "ONAY_TR_XXXXXX";
$payload = array(
    "service" => "whatsapp",
    "country" => "1"
);

$ch = curl_init("https://api.onaytr.com/v2/order");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    "Authorization: " . $apiKey,
    "Content-Type: application/json"
));

$response = curl_exec($ch);
echo $response;
?>`,
  curl: `curl -X POST "https://api.onaytr.com/v2/order" \\
  -H "Authorization: ONAY_TR_XXXXXX" \\
  -H "Content-Type: application/json" \\
  -d '{"service": "whatsapp", "country": "1"}'`
};

// COUNTRIES_CAROUSEL replaced by CAROUSEL_DATA above

export default function LandingPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const { t } = useLanguage();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState<'python' | 'node' | 'php' | 'curl'>('python');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Phone Mockup Active Tab
  const [phoneTab, setPhoneTab] = useState<'sim' | 'list'>('sim');

  // Interactive Sandbox State
  const [simStep, setSimStep] = useState<'init' | 'waiting' | 'done'>('init');
  const [simService, setSimService] = useState<'whatsapp' | 'telegram' | 'discord'>('whatsapp');
  const [simCountry, setSimCountry] = useState('');
  const [simNumber, setSimNumber] = useState('');
  const [simCode, setSimCode] = useState('');
  const [countdown, setCountdown] = useState(120);


  // Auto Countdown for Sandbox
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (simStep === 'waiting' && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0) {
      setSimStep('init');
    }
    return () => clearTimeout(timer);
  }, [simStep, countdown]);

  // Simulation handler
  const handleStartSim = () => {
    // Generate random phone number based on selected service
    const area = Math.floor(200 + Math.random() * 800);
    const suffix1 = Math.floor(100 + Math.random() * 900);
    const suffix2 = Math.floor(1000 + Math.random() * 9000);
    setSimNumber(`+1 (${area}) ${suffix1}-${suffix2}`);
    setCountdown(120);
    setSimStep('waiting');

    // Trigger SMS delivery after 3.5 seconds
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSimCode(code);
      setSimStep('done');
    }, 3500);
  };

  // Sparkline renderer helper
  const renderSparkline = (data: number[]) => {
    const points = data.map((val, i) => `${(i * 12) + 2},${40 - (val / 2.8)}`).join(' ');
    return (
      <svg className="w-16 h-6 inline-block opacity-80" viewBox="0 0 80 40">
        <polyline
          fill="none"
          stroke="#4648d4"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  const filteredPricing = PRICING_DATA.filter(item => 
    t(item.countryKey as any).toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-mesh-premium text-[#0B1C30] antialiased overflow-x-hidden min-h-screen">
      


      {/* ═══════════════════════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════════════════════ */}
      <main className="pt-20">
        
        {/* ─── Hero Section ─── */}
        <section className="relative min-h-[90vh] flex items-center px-6 md:px-24 max-w-[1440px] mx-auto micro-grid overflow-visible">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full py-16">
            
            {/* Left Copy Column */}
            <div className="lg:col-span-7 space-y-10 relative z-10 animate-fade-up">
              <div className="inline-flex items-center gap-3 bg-white/60 border border-[#4648d4]/10 px-6 py-2.5 rounded-full shadow-sm backdrop-blur-md">
                <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-ping"></span>
                <span className="text-[10px] sm:text-xs text-[#4648d4] tracking-widest uppercase font-black">{t('lp_hero_badge')}</span>
              </div>
              
              <h1 className="text-[48px] md:text-[68px] lg:text-[84px] leading-[0.95] font-black tracking-tighter text-[#0B1C30]">
                {t('lp_hero_h1_1')} <br/><span className="text-gradient">{t('lp_hero_h1_2')}</span> <br/>{t('lp_hero_h1_3')}
              </h1>
              
              <p className="text-lg md:text-xl text-[#464554] max-w-2xl leading-relaxed font-medium">
                {t('lp_hero_desc')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 pt-4">
                <Link href="/auth/register" className="bg-[#4648d4] text-white px-10 py-5 rounded-2xl text-lg font-bold shadow-2xl shadow-[#4648d4]/30 hover:scale-[1.03] hover:shadow-[#4648d4]/40 active:scale-95 transition-all flex items-center justify-center gap-3">
                  <Rocket className="w-5 h-5 text-white" />
                  {t('lp_hero_cta1')}
                </Link>
                <a href="#how-it-works" className="bg-white border border-[#C7C4D7]/30 text-[#0B1C30] px-10 py-5 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 hover:bg-[#EFF4FF] transition-all">
                  <Play className="w-5 h-5 fill-[#0B1C30]" />
                  {t('lp_hero_cta2')}
                </a>
              </div>
              
              <div className="flex items-center gap-12 pt-8">
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-[#4648d4]">{t('lp_hero_stat1_val')}</span>
                  <span className="text-[11px] font-bold text-[#464554] uppercase tracking-widest">{t('lp_hero_stat1_label')}</span>
                </div>
                <div className="w-px h-10 bg-[#C7C4D7]/20"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-[#4648d4]">{t('lp_hero_stat2_val')}</span>
                  <span className="text-[11px] font-bold text-[#464554] uppercase tracking-widest">{t('lp_hero_stat2_label')}</span>
                </div>
                <div className="w-px h-10 bg-[#C7C4D7]/20"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-[#4648d4]">{t('lp_hero_stat3_val')}</span>
                  <span className="text-[11px] font-bold text-[#464554] uppercase tracking-widest">{t('lp_hero_stat3_label')}</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Sandbox Simulator */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto w-[300px] md:w-[360px] animate-float">
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#4648d4]/10 to-[#712ae2]/10 blur-[80px] rounded-full"></div>
                
                <div className="relative bg-[#0B1C30] rounded-[3.5rem] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[10px] border-[#0B1C30]/5">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#0B1C30] rounded-b-3xl z-20"></div>
                  
                  <div className="bg-[#f8f9ff] h-[640px] w-full rounded-[2.8rem] overflow-hidden flex flex-col justify-between">
                    
                    {/* Device Header */}
                    <div>
                      <div className="h-12 flex items-end justify-between px-8 pb-2">
                        <span className="text-xs font-black">10:24</span>
                        <div className="flex gap-1 text-xs">
                          <Activity className="w-3.5 h-3.5" />
                          <Activity className="w-3.5 h-3.5 opacity-60" />
                        </div>
                      </div>
                      
                      {/* Interactive Switch tabs inside phone */}
                      <div className="px-6 pt-3 flex gap-2 border-b border-[#C7C4D7]/10">
                        <button
                          onClick={() => setPhoneTab('sim')}
                          className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${
                            phoneTab === 'sim' ? 'border-[#4648d4] text-[#4648d4]' : 'border-transparent text-[#464554]/60'
                          }`}
                        >
                          {t('lp_sim_tab1')}
                        </button>
                        <button
                          onClick={() => setPhoneTab('list')}
                          className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${
                            phoneTab === 'list' ? 'border-[#4648d4] text-[#4648d4]' : 'border-transparent text-[#464554]/60'
                          }`}
                        >
                          {t('lp_sim_tab2')}
                        </button>
                      </div>
                    </div>

                    {/* Device Content Frame */}
                    <div className="flex-1 p-6 overflow-y-auto no-scrollbar flex flex-col justify-between">
                      {phoneTab === 'list' ? (
                        /* Static Panel list (Old look) */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-black">{t('lp_sim_panel_title')}</h3>
                            <div className="w-6 h-6 bg-[#4648d4]/10 rounded-full flex items-center justify-center text-[#4648d4]">
                              <Plus className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-[#C7C4D7]/10 relative">
                              <div className="absolute top-0 right-0 p-2">
                                <span className="text-[9px] font-bold text-green-500 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> {t('lp_sim_active_live')}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center text-white">
                                  <MessageSquare className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <div className="text-[8px] font-black text-[#464554] uppercase tracking-widest">WhatsApp Business</div>
                                  <div className="text-base font-mono font-bold text-[#4648d4]">841-209</div>
                                  <div className="text-[9px] text-[#464554]/60">{t('lp_sim_just_received')}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4 bg-white/60 rounded-2xl border border-[#C7C4D7]/10 opacity-70">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#0088cc] rounded-xl flex items-center justify-center text-white">
                                  <Send className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <div className="text-[8px] font-black text-[#464554] uppercase tracking-widest">Telegram Messenger</div>
                                  <div className="text-base font-mono font-bold text-[#0B1C30]">94021</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Dynamic Interactive Simulation Panel */
                        <div className="flex-1 flex flex-col justify-between h-full">
                          
                          {simStep === 'init' && (
                            <div className="space-y-5 my-auto text-center">
                              <div className="w-14 h-14 bg-[#4648d4]/10 rounded-2xl flex items-center justify-center text-[#4648d4] mx-auto animate-bounce">
                                <Sparkles className="w-7 h-7" />
                              </div>
                              <div className="space-y-1.5">
                                <h4 className="text-sm font-black text-[#0B1C30]">{t('lp_sim_title')}</h4>
                                <p className="text-[10px] text-[#464554]/70 max-w-[200px] mx-auto font-medium">{t('lp_sim_desc')}</p>
                              </div>
                              
                              <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#C7C4D7]/15 shadow-sm text-left">
                                <div>
                                  <label className="text-[9px] font-bold text-[#464554] uppercase tracking-wider block mb-1">{t('lp_sim_step1')}</label>
                                  <div className="grid grid-cols-3 gap-1">
                                    {['whatsapp', 'telegram', 'discord'].map(svc => (
                                      <button
                                        key={svc}
                                        onClick={() => setSimService(svc as any)}
                                        className={`py-1 text-[9px] font-bold rounded capitalize border ${
                                          simService === svc ? 'bg-[#4648d4] text-white border-[#4648d4]' : 'bg-transparent text-[#464554] border-[#C7C4D7]/30'
                                        }`}
                                      >
                                        {svc}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[9px] font-bold text-[#464554] uppercase tracking-wider block mb-1">{t('lp_sim_step2')}</label>
                                  <select
                                    value={simCountry}
                                    onChange={(e) => setSimCountry(e.target.value)}
                                    className="w-full text-[10px] p-2 border border-[#C7C4D7]/30 rounded bg-white outline-none font-bold"
                                  >
                                    <option value="us">{t('lp_sim_country_us')}</option>
                                    <option value="gb">{t('lp_sim_country_gb')}</option>
                                    <option value="tr">{t('lp_sim_country_tr')}</option>
                                    <option value="de">{t('lp_sim_country_de')}</option>
                                  </select>
                                </div>
                              </div>
                              
                              <button
                                onClick={handleStartSim}
                                className="w-full py-3 bg-[#4648d4] hover:bg-[#393bb3] text-white rounded-xl text-xs font-black shadow-lg shadow-[#4648d4]/10 transition-colors flex items-center justify-center gap-2"
                              >
                                <PlayCircle className="w-4 h-4 text-white" />
                                {t('lp_sim_btn')}
                              </button>
                            </div>
                          )}

                          {simStep === 'waiting' && (
                            <div className="space-y-6 my-auto text-center">
                              <div className="w-12 h-12 rounded-full border-2 border-t-[#4648d4] border-r-transparent border-b-transparent border-l-transparent animate-spin mx-auto"></div>
                              <div className="space-y-2">
                                <span className="text-[9px] font-black bg-[#FFFBEB] text-[#D97706] px-2 py-0.5 rounded border border-[#D97706]/10 uppercase tracking-widest">
                                  {t('lp_sim_waiting_badge')}
                                </span>
                                <p className="font-mono text-base font-bold text-[#4648d4] tracking-wider">{simNumber}</p>
                                <p className="text-[10px] text-[#464554]/70">{t('lp_sim_waiting_msg')}</p>
                              </div>
                              
                              <div className="bg-white border border-[#C7C4D7]/15 p-4 rounded-xl space-y-1 w-full max-w-[220px] mx-auto text-left">
                                <div className="flex justify-between items-center text-[10px] text-[#464554]/60">
                                  <span>{t('lp_sim_countdown')}</span>
                                  <span className="mono font-bold text-[#B90538]">
                                    {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                                  </span>
                                </div>
                                <div className="w-full bg-[#EFF4FF] h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-[#4648d4] h-full transition-all duration-1000" style={{ width: `${(countdown / 120) * 100}%` }}></div>
                                </div>
                              </div>
                            </div>
                          )}

                          {simStep === 'done' && (
                            <div className="space-y-6 my-auto text-center">
                              <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto animate-pulse">
                                <Check className="w-8 h-8" strokeWidth={3} />
                              </div>
                              
                              <div className="space-y-2">
                                <span className="text-[9px] font-black bg-[#F0FDF4] text-green-700 px-2 py-0.5 rounded border border-green-700/10 uppercase tracking-widest">
                                  {t('lp_sim_done_badge')}
                                </span>
                                <p className="font-mono text-[9px] text-[#464554]/60">{simNumber}</p>
                              </div>
                              
                              {/* Sliding received notification card inside mock screen */}
                              <div className="p-4.5 bg-white rounded-2xl border border-green-200 shadow-lg text-left space-y-2 entry-slide relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
                                <div className="flex items-center gap-2 justify-between">
                                  <span className="text-[9px] font-black text-[#464554] uppercase tracking-wider capitalize">{simService} {t('lp_sim_done_approval')}</span>
                                  <span className="text-[8px] text-[#A39E98]">{t('lp_sim_done_time')}</span>
                                </div>
                                <p className="text-xs font-semibold text-[#0B1C30]">
                                  {t('lp_sim_done_code_label')} <span className="font-mono text-sm font-black text-[#4648d4] tracking-widest">{simCode}</span>
                                </p>
                              </div>

                              <button
                                onClick={() => setSimStep('init')}
                                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-[#0B1C30] rounded-xl text-[11px] font-bold transition-colors"
                              >
                                {t('lp_sim_reset')}
                              </button>
                            </div>
                          )}

                        </div>
                      )}
                    </div>

                    {/* Home Indicator */}
                    <div className="h-8 flex items-center justify-center">
                      <div className="w-28 h-1 bg-white/40 rounded-full"></div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </section>

        {/* ─── Endless Country Flag Carousel (Marquee) ─── */}
        <section className="border-y border-[#C7C4D7]/15 py-4 bg-white/50 relative overflow-hidden">
          <div className="marquee-wrap">
            <div className="animate-marquee flex items-center">
              {CAROUSEL_DATA.concat(CAROUSEL_DATA).map((c, i) => (
                <div key={i} className="flex items-center gap-3.5 mx-8 shrink-0">
                  <span className={`fi ${c.flag} w-6 h-4 shadow-sm border border-black/10 rounded-sm`} />
                  <span className="text-xs font-bold text-[#0B1C30] tracking-tight">{t(c.nameKey as any)}</span>
                  <span className="text-[11px] font-black text-[#4648d4] bg-[#4648d4]/5 px-2 py-0.5 rounded">
                    {c.price}{t('lp_carousel_from')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Global Connectivity Map ─── */}
        <section className="py-32 relative bg-[#0B1C30] overflow-hidden" id="connectivity">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute network-node" style={{ left: '20%', top: '30%' }}></div>
            <div className="absolute network-node" style={{ left: '55%', top: '40%' }}></div>
            <div className="absolute network-node" style={{ left: '35%', top: '70%' }}></div>
            <div className="absolute network-node" style={{ left: '80%', top: '50%' }}></div>
          </div>
          
          <div className="max-w-[1440px] mx-auto px-6 md:px-24 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              
              <div className="space-y-8 animate-fade-up">
                <div className="text-[#4648d4] font-black uppercase text-xs tracking-[0.4em]">{t('lp_connect_badge')}</div>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                  {t('lp_connect_h2')} <span className="text-[#4648d4]">{t('lp_connect_h2_accent')}</span> {t('lp_connect_h2_suffix')}
                </h2>
                <p className="text-white/60 text-lg leading-relaxed">
                  {t('lp_connect_desc')}
                </p>
                <div className="grid grid-cols-2 gap-8 pt-8">
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 glass-premium">
                    <div className="text-3xl font-black text-white mb-1">42</div>
                    <div className="text-xs font-bold text-white/40 uppercase tracking-widest">{t('lp_connect_stat1')}</div>
                  </div>
                  <div className="p-6 rounded-3xl bg-white/5 border border-white/10 glass-premium">
                    <div className="text-3xl font-black text-white mb-1">99.99%</div>
                    <div className="text-xs font-bold text-white/40 uppercase tracking-widest">{t('lp_connect_stat2')}</div>
                  </div>
                </div>
              </div>
              
              <div className="relative aspect-square lg:aspect-video rounded-4xl overflow-hidden bg-gradient-to-br from-[#4648d4]/20 to-[#712ae2]/20 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Globe className="text-white/20 w-[120px] h-[120px] mx-auto" />
                  <div className="flex gap-2 justify-center">
                    <span className="w-2 h-2 bg-[#4648d4] rounded-full animate-pulse"></span>
                    <span className="w-2 h-2 bg-[#4648d4] rounded-full animate-pulse [animation-delay:200ms]"></span>
                    <span className="w-2 h-2 bg-[#4648d4] rounded-full animate-pulse [animation-delay:400ms]"></span>
                  </div>
                  <div className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">{t('lp_connect_live')}</div>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* ─── Services Grid ─── */}
        <section className="py-32 bg-white" id="services">
          <div className="max-w-[1440px] mx-auto px-6 md:px-24">
            
            <div className="text-center mb-24 space-y-4">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter">{t('lp_services_h2_1')} <span className="text-gradient">{t('lp_services_h2_2')}</span></h2>
              <p className="text-[#464554] max-w-2xl mx-auto font-medium">{t('lp_services_desc')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="md:col-span-2 p-10 bg-[#EFF4FF] rounded-4xl border border-[#C7C4D7]/10 hover:shadow-2xl hover:shadow-[#4648d4]/5 transition-all group overflow-hidden relative">
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-[#4648d4]/10 rounded-3xl flex items-center justify-center text-[#4648d4] mb-8 group-hover:bg-[#4648d4] group-hover:text-white transition-all duration-500 shadow-sm">
                    <Rocket className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black mb-4">{t('lp_services_s1_title')}</h3>
                  <p className="text-[#464554] max-w-md leading-relaxed">{t('lp_services_s1_desc')}</p>
                </div>
                <div className="absolute -right-20 -bottom-20 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Sparkles className="w-[300px] h-[300px] text-[#4648d4]" />
                </div>
              </div>
              
              <div className="p-10 bg-white border border-[#C7C4D7]/10 rounded-4xl hover:border-[#4648d4]/20 transition-all group">
                <div className="w-16 h-16 bg-[#712ae2]/10 rounded-3xl flex items-center justify-center text-[#712ae2] mb-8 group-hover:bg-[#712ae2] group-hover:text-white transition-all duration-500 shadow-sm">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black mb-4">{t('lp_services_s2_title')}</h3>
                <p className="text-[#464554] leading-relaxed">{t('lp_services_s2_desc')}</p>
              </div>
              
              <div className="p-10 bg-white border border-[#C7C4D7]/10 rounded-4xl hover:border-[#4648d4]/20 transition-all group">
                <div className="w-16 h-16 bg-[#b90538]/10 rounded-3xl flex items-center justify-center text-[#b90538] mb-8 group-hover:bg-[#b90538] group-hover:text-white transition-all duration-500 shadow-sm">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black mb-4">{t('lp_services_s3_title')}</h3>
                <p className="text-[#464554] leading-relaxed">{t('lp_services_s3_desc')}</p>
              </div>
              
              <div className="md:col-span-2 p-10 bg-[#4648d4]/5 rounded-4xl border border-[#4648d4]/10 hover:shadow-2xl transition-all group overflow-hidden relative">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                  <div>
                    <div className="w-16 h-16 bg-[#4648d4] rounded-3xl flex items-center justify-center text-white mb-8 shadow-lg shadow-[#4648d4]/20">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-black mb-4">{t('lp_services_s4_title')}</h3>
                    <p className="text-[#464554] leading-relaxed">{t('lp_services_s4_desc')}</p>
                  </div>
                  <div className="flex gap-4 items-center justify-center">
                    <div className="space-y-4">
                      <div className="w-24 h-12 bg-white rounded-xl shadow-sm"></div>
                      <div className="w-24 h-12 bg-white rounded-xl shadow-sm opacity-50"></div>
                    </div>
                    <div className="w-32 h-40 bg-white rounded-2xl shadow-xl border border-[#4648d4]/10 p-4 flex flex-col justify-between">
                      <div className="w-full h-2 bg-[#4648d4]/10 rounded-full"></div>
                      <div className="w-2/3 h-2 bg-[#4648d4]/10 rounded-full"></div>
                      <Link href="/rent" className="mt-auto w-full h-10 bg-[#4648d4] rounded-xl flex items-center justify-center text-white text-xs font-bold hover:bg-[#393bb3] transition-colors">{t('lp_services_rent_btn')}</Link>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* ─── 3 Adımda SMS Onayı ─── */}
        <section className="py-32 bg-white border-t border-[#C7C4D7]/10 overflow-hidden" id="how-it-works">
          <div className="max-w-[1440px] mx-auto px-6 md:px-24">
            
            <div className="text-center mb-24">
              <div className="text-[#4648d4] font-black uppercase text-xs tracking-[0.4em] mb-4">{t('lp_steps_badge')}</div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter">{t('lp_steps_h2_1')} <span className="text-gradient">{t('lp_steps_h2_2')}</span></h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-fade-up">
              
              {/* Step 1 */}
              <div className="group flex flex-col items-center text-center space-y-8">
                <div className="relative">
                  <div className="absolute -inset-4 bg-[#4648d4]/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative w-[280px] h-[560px] bg-[#0B1C30] rounded-[3rem] p-2.5 shadow-2xl border-[8px] border-[#0B1C30]/5 transition-transform duration-500 group-hover:-translate-y-4">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#0B1C30] rounded-b-2xl z-20"></div>
                    <div className="bg-white h-full w-full rounded-[2.2rem] overflow-hidden flex flex-col">
                      <div className="p-6 pt-12 space-y-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-8 h-8 bg-[#4648d4]/10 rounded-lg"></div>
                          <div className="w-24 h-2 bg-[#C7C4D7]/20 rounded-full"></div>
                        </div>
                        <div className="space-y-4">
                          <div className="h-32 bg-[#EFF4FF] rounded-2xl flex items-center justify-center">
                            <Rocket className="w-10 h-10 text-[#4648d4]/40" />
                          </div>
                          <div className="space-y-2">
                            <div className="h-2 w-full bg-[#C7C4D7]/10 rounded-full"></div>
                            <div className="h-2 w-2/3 bg-[#C7C4D7]/10 rounded-full"></div>
                          </div>
                          <div className="pt-4">
                            <div className="h-12 bg-[#4648d4] rounded-xl flex items-center justify-center text-white text-xs font-bold">{t('lp_steps_1_btn')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-2xl font-black text-[#4648d4] border border-[#4648d4]/5">01</div>
                </div>
                <div className="space-y-3 max-w-xs">
                  <h3 className="text-2xl font-black">{t('lp_steps_1_title')}</h3>
                  <p className="text-[#464554] font-medium leading-relaxed">{t('lp_steps_1_desc')}</p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="group flex flex-col items-center text-center space-y-8">
                <div className="relative">
                  <div className="absolute -inset-4 bg-[#4648d4]/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative w-[280px] h-[560px] bg-[#0B1C30] rounded-[3rem] p-2.5 shadow-2xl border-[8px] border-[#0B1C30]/5 transition-transform duration-500 group-hover:-translate-y-4">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#0B1C30] rounded-b-2xl z-20"></div>
                    <div className="bg-white h-full w-full rounded-[2.2rem] overflow-hidden flex flex-col">
                      <div className="p-6 pt-12 space-y-4">
                        <div className="h-10 bg-[#EFF4FF] rounded-xl flex items-center px-4 gap-3">
                          <Search className="w-4 h-4 text-[#464554]" />
                          <div className="h-1.5 w-20 bg-[#C7C4D7]/30 rounded-full"></div>
                        </div>
                        <div className="space-y-3">
                          <div className="p-4 border border-[#4648d4]/20 bg-[#4648d4]/5 rounded-xl flex items-center gap-3">
                            <span className="fi fi-us w-7 h-5 shadow-sm border border-black/5" />
                            <div className="h-2 w-24 bg-[#4648d4]/40 rounded-full"></div>
                          </div>
                          <div className="p-4 border border-[#C7C4D7]/10 rounded-xl flex items-center gap-3">
                            <span className="fi fi-gb w-7 h-5 shadow-sm border border-black/5" />
                            <div className="h-2 w-24 bg-[#C7C4D7]/20 rounded-full"></div>
                          </div>
                          <div className="p-4 border border-[#C7C4D7]/10 rounded-xl flex items-center gap-3">
                            <span className="fi fi-tr w-7 h-5 shadow-sm border border-black/5" />
                            <div className="h-2 w-24 bg-[#C7C4D7]/20 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-2xl font-black text-[#4648d4] border border-[#4648d4]/5">02</div>
                </div>
                <div className="space-y-3 max-w-xs">
                  <h3 className="text-2xl font-black">{t('lp_steps_2_title')}</h3>
                  <p className="text-[#464554] font-medium leading-relaxed">{t('lp_steps_2_desc')}</p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="group flex flex-col items-center text-center space-y-8">
                <div className="relative">
                  <div className="absolute -inset-4 bg-[#4648d4]/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative w-[280px] h-[560px] bg-[#0B1C30] rounded-[3rem] p-2.5 shadow-2xl border-[8px] border-[#0B1C30]/5 transition-transform duration-500 group-hover:-translate-y-4">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#0B1C30] rounded-b-2xl z-20"></div>
                    <div className="bg-white h-full w-full rounded-[2.2rem] overflow-hidden flex flex-col">
                      <div className="p-6 pt-12 space-y-6">
                        <div className="text-center space-y-2">
                          <div className="text-[10px] font-black text-[#4648d4] uppercase tracking-widest">{t('lp_steps_3_code')}</div>
                          <div className="text-3xl font-mono font-black tracking-[0.2em] text-[#0B1C30]">841 209</div>
                        </div>
                        <div className="p-6 bg-green-50 rounded-2xl border border-green-100 flex flex-col items-center gap-4">
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                            <Check className="w-6 h-6 text-white" strokeWidth={3} />
                          </div>
                          <div className="text-xs font-bold text-green-700">{t('lp_steps_3_success')}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 w-full bg-[#C7C4D7]/10 rounded-full"></div>
                          <div className="h-2 w-full bg-[#C7C4D7]/10 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-2xl font-black text-[#4648d4] border border-[#4648d4]/5">03</div>
                </div>
                <div className="space-y-3 max-w-xs">
                  <h3 className="text-2xl font-black">{t('lp_steps_3_title')}</h3>
                  <p className="text-[#464554] font-medium leading-relaxed">{t('lp_steps_3_desc')}</p>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* ─── Fiyat Listesi ─── */}
        <section className="py-32 bg-[#F8F9FF]" id="pricing">
          <div className="max-w-[1440px] mx-auto px-6 md:px-24">
            
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-[#4648d4] font-black uppercase text-xs tracking-widest">
                  <Check className="w-4 h-4 text-[#4648d4]" /> {t('lp_pricing_badge')}
                </div>
                <h2 className="text-4xl md:text-5xl font-black">{t('lp_pricing_h2')}</h2>
              </div>
              
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#464554] w-5 h-5" />
                <input
                  className="w-full bg-white border border-[#C7C4D7]/20 rounded-2xl pl-12 pr-6 py-5 focus:ring-2 focus:ring-[#4648d4]/20 text-sm outline-none font-medium shadow-sm animate-fade-up"
                  placeholder={t('lp_pricing_search')}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto rounded-[2.5rem] border border-[#C7C4D7]/10 shadow-2xl shadow-[#4648d4]/5 bg-white animate-fade-up">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-[#EFF4FF]/50 border-b border-[#C7C4D7]/10">
                  <tr>
                    <th className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-[#464554]">{t('lp_pricing_col1')}</th>
                    <th className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-[#464554]">{t('lp_pricing_col2')}</th>
                    <th className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-[#464554]">{t('lp_pricing_col3')}</th>
                    <th className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-[#464554] text-right">{t('lp_pricing_col4')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C7C4D7]/5">
                  {filteredPricing.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#4648d4]/[0.02] transition-colors group">
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-4">
                          <span className={`fi ${item.flagClass} w-9 h-6 shadow-sm border border-[#C7C4D7]/20 shrink-0`} />
                          <span className="font-bold text-[#0B1C30]">{t(item.countryKey as any)} ({item.code})</span>
                        </div>
                      </td>
                      <td className="px-10 py-7 font-medium text-[#464554]">{item.service}</td>
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.rateClass}`}>
                            {t(item.rateKey as any)}
                          </span>
                          {/* Real-time sparkline graph render */}
                          {renderSparkline(item.sparkData)}
                        </div>
                      </td>
                      <td className="px-10 py-7 text-right font-mono font-black text-[#4648d4] text-xl">{item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/dashboard" className="inline-flex items-center gap-3 px-10 py-4 bg-[#4648d4] text-white font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-[#4648d4]/20">
                {t('lp_pricing_cta')}
                <ChevronRight className="w-5 h-5 text-white" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Developer Hub ─── */}
        <section className="py-32 bg-[#0B1C30] relative" id="developer">
          <div className="max-w-[1440px] mx-auto px-6 md:px-24">
            <div className="flex flex-col lg:flex-row gap-20 items-center">
              
              <div className="lg:w-1/2 space-y-8">
                <div className="inline-flex items-center gap-2 text-[#4648d4] font-black uppercase text-[10px] tracking-[0.4em]">{t('lp_dev_badge')}</div>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">{t('lp_dev_h2_1')} <br/><span className="text-[#4648d4]">{t('lp_dev_h2_accent')}</span> {t('lp_dev_h2_2')}</h2>
                <p className="text-white/60 text-lg leading-relaxed">
                  {t('lp_dev_desc')}
                </p>
                <ul className="space-y-4 text-white/80">
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-[#4648d4]" /> {t('lp_dev_feat1')}</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-[#4648d4]" /> {t('lp_dev_feat2')}</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-[#4648d4]" /> {t('lp_dev_feat3')}</li>
                </ul>
                <div className="pt-6">
                  <Link href="/help" className="bg-white text-[#0B1C30] px-8 py-4 rounded-2xl font-black hover:scale-105 transition-all flex items-center gap-3 w-fit">
                    {t('lp_dev_hub_btn')}
                    <ExternalLink className="w-4 h-4 text-[#0B1C30]" />
                  </Link>
                </div>
              </div>
              
              <div className="lg:w-1/2 w-full">
                <div className="bg-[#1e1e2e] rounded-3xl overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10">
                  <div className="flex items-center justify-between px-6 py-4 bg-[#181825] border-b border-white/5">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#f38ba8]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#f9e2af]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#a6e3a1]"></div>
                    </div>
                    <div className="text-[11px] font-mono text-white/40">sms_api_v2.py</div>
                    <div className="w-10"></div>
                  </div>
                  
                  <div className="flex">
                    <div className="w-12 bg-[#11111b] py-6 flex flex-col items-center gap-4 text-white/20">
                      <FileText className="w-5 h-5" />
                      <Search className="w-5 h-5" />
                      <Settings className="w-5 h-5" />
                    </div>
                    
                    <div className="p-8 flex-1 font-mono text-sm overflow-x-auto no-scrollbar">
                      <div className="flex gap-6 border-b border-white/5 mb-6 text-white/40 font-bold text-[11px]">
                        <button onClick={() => setSelectedLang('python')} className={`pb-2 ${selectedLang === 'python' ? 'border-b-2 border-[#4648d4] text-white' : ''}`}>Python</button>
                        <button onClick={() => setSelectedLang('node')} className={`pb-2 ${selectedLang === 'node' ? 'border-b-2 border-[#4648d4] text-white' : ''}`}>Node.js</button>
                        <button onClick={() => setSelectedLang('php')} className={`pb-2 ${selectedLang === 'php' ? 'border-b-2 border-[#4648d4] text-white' : ''}`}>PHP</button>
                        <button onClick={() => setSelectedLang('curl')} className={`pb-2 ${selectedLang === 'curl' ? 'border-b-2 border-[#4648d4] text-white' : ''}`}>cURL</button>
                      </div>
                      
                      <pre className="text-[#cdd6f4] whitespace-pre overflow-x-auto">
                        <code>{CODE_EXAMPLES[selectedLang]}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* ─── Enterprise Trust Grid ─── */}
        <section className="py-32 bg-[#EFF4FF]/30 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#4648d4]/5 rounded-full blur-[100px]"></div>
          <div className="max-w-[1440px] mx-auto px-6 md:px-24">
            
            <div className="text-center mb-24">
              <h2 className="text-4xl font-black">{t('lp_trust_h2')}</h2>
              <p className="text-[#464554] mt-4 font-medium">{t('lp_trust_desc')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2 p-10 glass-premium rounded-4xl border-glow transition-all">
                <Lock className="text-[#4648d4] w-12 h-12 mb-6" />
                <h3 className="text-2xl font-black mb-4">{t('lp_trust_s1_title')}</h3>
                <p className="text-[#464554] leading-relaxed font-medium">{t('lp_trust_s1_desc')}</p>
              </div>
              
              <div className="p-10 glass-premium rounded-4xl border-glow transition-all">
                <FileCheck className="text-[#4648d4] w-12 h-12 mb-6" />
                <h3 className="text-xl font-black mb-4">{t('lp_trust_s2_title')}</h3>
                <p className="text-sm text-[#464554] leading-relaxed">{t('lp_trust_s2_desc')}</p>
              </div>
              
              <div className="p-10 glass-premium rounded-4xl border-glow transition-all">
                <History className="text-[#4648d4] w-12 h-12 mb-6" />
                <h3 className="text-xl font-black mb-4">{t('lp_trust_s3_title')}</h3>
                <p className="text-sm text-[#464554] leading-relaxed">{t('lp_trust_s3_desc')}</p>
              </div>
            </div>
            
          </div>
        </section>

        {/* ─── Sıkça Sorulan Sorular ─── */}
        <section className="py-32 bg-white" id="faq">
          <div className="max-w-[900px] mx-auto px-6">
            
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-6">{t('lp_faq_h2')}</h2>
              <p className="text-[#464554] font-medium font-sans">{t('lp_faq_desc')}</p>
            </div>
            
            <div className="space-y-4">
              {FAQ_KEYS.map((faq, idx) => (
                <div key={idx} className="bg-[#FAF8F5] rounded-3xl border border-[#C7C4D7]/10 overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full px-8 py-6 flex items-center justify-between text-left group"
                  >
                    <span className="text-lg font-bold text-[#0B1C30] group-hover:text-[#4648d4] transition-colors">{t(faq.qKey as any)}</span>
                    <ChevronDown className={`w-5 h-5 text-[#4648d4] transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  <div
                    className="transition-all duration-300 ease-in-out"
                    style={{
                      maxHeight: activeFaq === idx ? '200px' : '0px',
                      opacity: activeFaq === idx ? 1 : 0,
                      overflow: 'hidden'
                    }}
                  >
                    <div className="px-8 pb-8 text-[#464554] leading-relaxed text-sm">
                      {t(faq.aKey as any)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </section>

        {/* ─── CTA Section ─── */}
        <section className="py-32 px-6 md:px-24 max-w-[1440px] mx-auto">
          <div className="bg-gradient-to-br from-[#4648d4] to-[#712ae2] rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden shadow-[0_40px_100px_-20px_rgba(70,72,212,0.4)] animate-fade-up">
            <div className="absolute inset-0 opacity-10 mix-blend-overlay micro-grid"></div>
            <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px]"></div>
            <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px]"></div>
            
            <div className="relative z-10 space-y-10">
              <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter">{t('lp_cta_h2_1')} <br/>{t('lp_cta_h2_2')}</h2>
              <p className="text-white/80 text-xl max-w-2xl mx-auto font-medium">{t('lp_cta_desc')}</p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link href="/auth/register" className="bg-white text-[#4648d4] px-12 py-5 rounded-2xl text-xl font-black hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-3">
                  <Rocket className="w-5 h-5 text-[#4648d4]" />
                  {t('lp_cta_btn1')}
                </Link>
                <Link href="/support" className="bg-[#6063ee]/20 text-white border border-white/30 px-12 py-5 rounded-2xl text-xl font-black hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                  <MessageSquare className="w-5 h-5 text-white" />
                  {t('lp_cta_btn2')}
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>



    </div>
  );
}
