"use client";

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { Terminal, Key, Shield, Code, ChevronRight, Copy, Check } from 'lucide-react';

const API_ENDPOINTS = [
  {
    method: "POST",
    path: "/v2/order",
    descTr: "Yeni bir sanal numara siparişi verir.",
    descEn: "Place a new virtual number order.",
    descAz: "Yeni virtual nömrə sifarişi yerləşdirir.",
    params: [
      { name: "service", type: "string", required: true, desc: "whatsapp, telegram, google, vb. servis kodu" },
      { name: "country", type: "string", required: true, desc: "usa, turkey, russia, vb. ülke kodu" }
    ],
    response: `{
  "success": true,
  "orderId": "ord_8f6c4a2b91",
  "number": "+14155552671",
  "expiresAt": "2026-07-18T22:30:00Z"
}`
  },
  {
    method: "GET",
    path: "/v2/order/check",
    descTr: "Sipariş durumunu ve gelen SMS kodunu sorgular.",
    descEn: "Check order status and incoming SMS code.",
    descAz: "Sifariş statusunu və gələn SMS kodunu yoxlayır.",
    params: [
      { name: "orderId", type: "string", required: true, desc: "Sipariş verirken dönen benzersiz ID" }
    ],
    response: `{
  "success": true,
  "status": "SMS_RECEIVED",
  "sms": [
    {
      "code": "481920",
      "text": "WhatsApp doğrulama kodunuz: 481-920",
      "receivedAt": "2026-07-18T22:15:32Z"
    }
  ]
}`
  },
  {
    method: "POST",
    path: "/v2/order/cancel",
    descTr: "Aktif bir siparişi iptal eder ve bakiyeyi iade eder.",
    descEn: "Cancel an active order and refund balance.",
    descAz: "Aktiv sifarişi ləğv edir və balansı geri qaytarır.",
    params: [
      { name: "orderId", type: "string", required: true, desc: "İptal edilmek istenen siparişin benzersiz ID'si" }
    ],
    response: `{
  "success": true,
  "message": "Order cancelled successfully, balance refunded."
}`
  },
  {
    method: "GET",
    path: "/v2/pricing",
    descTr: "Güncel bakiye/fiyat tablosunu çeker.",
    descEn: "Fetch current pricing and stock details.",
    descAz: "Cari qiymət və stok siyahısını çəkir.",
    params: [],
    response: `{
  "success": true,
  "countries": [
    { "code": "usa", "name": "USA", "count": 2500, "minPrice": 12.50 }
  ],
  "apps": [
    { "name": "whatsapp", "count": 15000, "minPrice": 4.50 }
  ]
}`
  }
];

const CODE_TEMPLATES = {
  curl: (method: string, path: string, params: any[]) => {
    const dataStr = params.length > 0 
      ? ` \\\n  -d '${JSON.stringify(params.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.name === "service" ? "whatsapp" : "usa" }), {}))}'`
      : "";
    return `curl -X ${method} "https://api.onaytr.com${path}" \\
  -H "Authorization: Bearer ONAY_TR_XXXXXX" \\
  -H "Content-Type: application/json"${dataStr}`;
  },
  python: (method: string, path: string, params: any[]) => {
    const dataStr = params.length > 0
      ? `\npayload = ${JSON.stringify(params.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.name === "service" ? "whatsapp" : "usa" }), {}), null, 4)}`
      : "";
    const methodCall = method.toLowerCase();
    const reqArgs = params.length > 0 ? `, json=payload` : "";
    return `import requests

api_key = "ONAY_TR_XXXXXX"
headers = {"Authorization": f"Bearer {api_key}"}
${dataStr}

response = requests.${methodCall}(
    "https://api.onaytr.com${path}"${reqArgs},
    headers=headers
)

print(response.json())`;
  },
  node: (method: string, path: string, params: any[]) => {
    const dataStr = params.length > 0
      ? `\nconst payload = ${JSON.stringify(params.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.name === "service" ? "whatsapp" : "usa" }), {}), null, 2)};`
      : "";
    const reqArgs = params.length > 0 ? `, payload` : "";
    return `const axios = require('axios');

const apiKey = 'ONAY_TR_XXXXXX';
const headers = { 'Authorization': \`Bearer \${apiKey}\` };
${dataStr}

axios.${method.toLowerCase()}('https://api.onaytr.com${path}'${params.length > 0 ? (method === 'GET' ? ', { params: payload, headers }' : `${reqArgs}, { headers }`) : ', { headers }'})
  .then(response => console.log(response.data))
  .catch(error => console.error(error));`;
  },
  php: (method: string, path: string, params: any[]) => {
    const dataStr = params.length > 0
      ? `\n$payload = ${JSON.stringify(params.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.name === "service" ? "whatsapp" : "usa" }), {}))};`
      : "";
    return `<?php
$apiKey = "ONAY_TR_XXXXXX";${dataStr}

$ch = curl_init("https://api.onaytr.com${path}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
${method === "POST" ? `curl_setopt($ch, CURLOPT_POST, true);\ncurl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));\n` : ""}curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    "Authorization: Bearer " . $apiKey,
    "Content-Type: application/json"
));

$response = curl_exec($ch);
echo $response;
?>`;
  }
};

export default function ApiDocsPage() {
  const { language } = useLanguage();
  const [selectedEndpoint, setSelectedEndpoint] = useState(API_ENDPOINTS[0]);
  const [selectedLang, setSelectedLang] = useState<'curl' | 'python' | 'node' | 'php'>('curl');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEndpointDesc = (ep: typeof API_ENDPOINTS[0]) => {
    if (language === 'az') return ep.descAz;
    if (language === 'en') return ep.descEn;
    return ep.descTr;
  };

  const activeCodeSnippet = CODE_TEMPLATES[selectedLang](selectedEndpoint.method, selectedEndpoint.path, selectedEndpoint.params);

  return (
    <div className="min-h-screen bg-[#F8F9FF] dark:bg-[#0D1117] pt-28 pb-16 text-left relative overflow-hidden">
      
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4648d4]/5 dark:bg-[#4648d4]/2 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#712ae2]/5 dark:bg-[#712ae2]/2 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute inset-0 micro-grid opacity-75 -z-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="h-14 w-14 bg-gradient-to-br from-[#4648d4] to-[#712ae2] rounded-2xl flex items-center justify-center shadow-lg shadow-[#4648d4]/10 mb-4 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <Terminal className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white display-font mb-4">
            {language === 'tr' ? 'Geliştirici API Dökümanı' : language === 'az' ? 'Tərtibatçı API Dökümanı' : 'Developer API Reference'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl text-base">
            {language === 'tr'
              ? 'OnayTR servislerini kendi yazılımlarınıza dakikalar içinde entegre edin. Hızlı, güvenilir ve JSON tabanlı güçlü REST API.'
              : language === 'az'
              ? 'OnayTR xidmətlərini öz proqram təminatınıza dəqiqələr içində inteqrasiya edin. Sürətli, etibarlı və JSON əsaslı güclü REST API.'
              : 'Integrate OnayTR services into your software within minutes. High-speed, reliable, and JSON-based robust REST API.'}
          </p>
        </div>

        {/* Info Grid (Auth details) */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          
          <div className="glass-premium p-6 rounded-2xl flex gap-4 items-start shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-[#4648d4]/10 text-[#4648d4] flex items-center justify-center shrink-0">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base display-font mb-1">
                {language === 'tr' ? 'API Yetkilendirmesi' : language === 'az' ? 'API İcazələndirilməsi' : 'API Authentication'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                {language === 'tr'
                  ? 'Tüm API isteklerinizde "Authorization: Bearer SIZIN_API_ANAHTARINIZ" başlığını yollamanız gerekmektedir. API anahtarınızı üyelik panelinizin Ayarlar sekmesinden alabilirsiniz.'
                  : language === 'az'
                  ? 'Bütün API sorğularınızda "Authorization: Bearer SIZIN_API_ACARINIZ" başlığını göndərməlisiniz. API açarınızı üzvlük panelinizin Parametrlər bölməsindən ala bilərsiniz.'
                  : 'For all API requests, you must include the header "Authorization: Bearer YOUR_API_KEY". You can obtain your API key from the Settings tab in your user panel.'}
              </p>
            </div>
          </div>

          <div className="glass-premium p-6 rounded-2xl flex gap-4 items-start shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-[#712ae2]/10 text-[#712ae2] flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base display-font mb-1">
                {language === 'tr' ? 'Hız Sınırları & Güvenlik' : language === 'az' ? 'Sürət Limitləri və Təhlükəsizlik' : 'Rate Limits & Security'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold leading-relaxed">
                {language === 'tr'
                  ? 'Sistemimiz saniyede maksimum 10 isteğe izin vermektedir. Fazlası durumunda HTTP 429 hatası döndürülür. Tüm istekleriniz SSL şifreleme alt yapısıyla korunur.'
                  : language === 'az'
                  ? 'Sistemimiz saniyədə maksimum 10 sorğuya icazə verir. Artıq olduqda HTTP 429 xətası qaytarılır. Bütün sorğularınız SSL şifrələmə infrastrukturu ilə qorunur.'
                  : 'Our system allows a maximum of 10 requests per second. Higher rates will return an HTTP 429 error. All requests are protected by SSL encryption.'}
              </p>
            </div>
          </div>

        </div>

        {/* Documentation Layout */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Sidebar Menu (3 Columns) */}
          <div className="lg:col-span-3 space-y-2">
            {API_ENDPOINTS.map((ep) => (
              <button
                key={ep.path}
                onClick={() => setSelectedEndpoint(ep)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-xs font-bold flex items-center justify-between ${
                  selectedEndpoint.path === ep.path 
                    ? 'bg-[#4648d4]/10 border-[#4648d4]/20 text-[#4648d4] dark:bg-[#4648d4]/15' 
                    : 'bg-white/50 dark:bg-slate-900/40 border-transparent hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider ${ep.method === 'POST' ? 'bg-blue-100 text-blue-750 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-750 dark:bg-green-900/30 dark:text-green-300'}`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">{ep.path}</span>
                </div>
                <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${selectedEndpoint.path === ep.path ? 'translate-x-0.5 text-[#4648d4]' : 'opacity-30'}`} />
              </button>
            ))}
          </div>

          {/* Docs & Playground Area (9 Columns) */}
          <div className="lg:col-span-9 grid md:grid-cols-2 gap-8">
            
            {/* Params & Details */}
            <div className="glass-premium p-6 md:p-8 rounded-3xl shadow-sm text-left">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-md font-black text-xs uppercase tracking-wider ${selectedEndpoint.method === 'POST' ? 'bg-blue-150 text-blue-800 dark:bg-blue-900/40 dark:text-blue-350' : 'bg-green-150 text-green-800 dark:bg-green-900/40 dark:text-green-350'}`}>
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-base font-black text-slate-800 dark:text-white">https://api.onaytr.com{selectedEndpoint.path}</span>
              </div>

              <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed mb-8">
                {getEndpointDesc(selectedEndpoint)}
              </p>

              {/* Parameters Table */}
              <h3 className="font-bold text-slate-800 dark:text-white text-sm display-font uppercase tracking-wider mb-4">
                {language === 'tr' ? 'İstek Parametreleri' : language === 'az' ? 'Sorğu Parametrləri' : 'Request Parameters'}
              </h3>
              {selectedEndpoint.params.length > 0 ? (
                <div className="border border-slate-100 dark:border-slate-800/60 rounded-xl overflow-hidden mb-6">
                  <div className="bg-slate-50 dark:bg-slate-850 px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest grid grid-cols-12">
                    <span className="col-span-4">Parametre</span>
                    <span className="col-span-3">Tip / Durum</span>
                    <span className="col-span-5">Açıklama</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {selectedEndpoint.params.map((p) => (
                      <div key={p.name} className="px-4 py-3 grid grid-cols-12 text-xs font-semibold items-center">
                        <span className="col-span-4 font-mono text-[#4648d4] font-bold">{p.name}</span>
                        <div className="col-span-3 flex flex-col gap-0.5">
                          <span className="text-[10px] text-slate-400 font-mono">{p.type}</span>
                          {p.required ? (
                            <span className="text-[9px] text-rose-500 font-black tracking-wider uppercase">Zorunlu</span>
                          ) : (
                            <span className="text-[9px] text-slate-400 font-black tracking-wider uppercase">Opsiyonel</span>
                          )}
                        </div>
                        <span className="col-span-5 text-slate-550 dark:text-slate-400 leading-normal">{p.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 font-bold rounded-xl mb-6">
                  {language === 'tr' ? 'Bu istek herhangi bir parametre gerektirmez.' : language === 'az' ? 'Bu sorğu heç bir parametr tələb etmir.' : 'This request does not require any parameters.'}
                </div>
              )}
            </div>

            {/* Code Block Window */}
            <div className="flex flex-col h-full bg-[#0D1117] border border-slate-800/60 rounded-3xl shadow-2xl overflow-hidden text-left relative min-h-[450px]">
              
              {/* Terminal Tab Bar */}
              <div className="bg-[#161B22] px-4 py-3 flex items-center justify-between border-b border-slate-800/50">
                <div className="flex gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80"></span>
                  <span className="h-3 w-3 rounded-full bg-amber-500/80"></span>
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80"></span>
                </div>
                
                {/* Language Selectors */}
                <div className="flex bg-[#0D1117] p-1 rounded-lg border border-slate-800">
                  {(['curl', 'python', 'node', 'php'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${selectedLang === lang ? 'bg-[#4648d4] text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      {lang === 'node' ? 'Node' : lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Snippet */}
              <div className="p-5 flex-1 font-mono text-[12px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre no-scrollbar">
                {activeCodeSnippet}
              </div>

              {/* Copy code floating button */}
              <button
                onClick={() => handleCopy(activeCodeSnippet)}
                className="absolute bottom-5 right-5 p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Response Code Section */}
              <div className="border-t border-slate-800/60 bg-[#161B22]/30 p-5 font-mono text-[11px] text-slate-450 leading-relaxed">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">JSON Response (200 OK)</span>
                <pre className="text-slate-400 max-h-40 overflow-y-auto no-scrollbar">{selectedEndpoint.response}</pre>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
