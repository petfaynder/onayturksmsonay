"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { 
  Key, 
  RefreshCw, 
  Copy, 
  Eye, 
  EyeOff, 
  Globe, 
  Terminal, 
  CheckCircle, 
  BookOpen, 
  Info, 
  ExternalLink,
  Check,
  Send
} from "lucide-react";

interface DeveloperClientProps {
  initialApiToken: string;
  initialWebhookUrl: string;
}

export default function DeveloperClient({ initialApiToken, initialWebhookUrl }: DeveloperClientProps) {
  const { showToast, showConfirm } = useToast();
  const { isDark } = useTheme();
  const { t, language } = useLanguage();

  const [apiToken, setApiToken] = useState(initialApiToken);
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl);
  
  const [webhookInput, setWebhookInput] = useState(initialWebhookUrl);
  const [showToken, setShowToken] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<"balance" | "services" | "pricing" | "buy" | "check" | "webhook">("balance");

  // Copy API Token helper
  const handleCopyToken = () => {
    if (!apiToken) {
      showToast(t('dev_toast_no_key'), "error");
      return;
    }
    navigator.clipboard.writeText(apiToken);
    setCopiedToken(true);
    showToast(t('dev_toast_key_copied'), "success");
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // Regenerate API Token
  const handleRegenerateToken = () => {
    showConfirm(
      t('dev_confirm_regen_title'),
      t('dev_confirm_regen_body'),
      async () => {
        setIsGeneratingToken(true);
        try {
          const res = await fetch("/api/user/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ generateApiToken: true })
          });
          const data = await res.json();
          if (data.success && data.apiToken) {
            setApiToken(data.apiToken);
            showToast(t('dev_toast_key_created'), "success");
          } else {
            showToast(data.error || t('dev_toast_key_failed'), "error");
          }
        } catch (err) {
          console.error(err);
          showToast(t('dev_toast_error'), "error");
        } finally {
          setIsGeneratingToken(false);
        }
      }
    );
  };

  // Save Webhook URL
  const handleSaveWebhook = async () => {
    if (webhookInput && !webhookInput.startsWith("http://") && !webhookInput.startsWith("https://")) {
      showToast(t('dev_toast_webhook_invalid'), "error");
      return;
    }

    setIsSavingWebhook(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl: webhookInput })
      });
      const data = await res.json();
      if (data.success) {
        setWebhookUrl(data.webhookUrl || "");
        showToast(t('dev_toast_webhook_saved'), "success");
      } else {
        showToast(data.error || t('dev_toast_settings_failed'), "error");
      }
    } catch (err) {
      console.error(err);
      showToast(t('dev_toast_conn_error'), "error");
    } finally {
      setIsSavingWebhook(false);
    }
  };

  // Test Webhook URL
  const handleTestWebhook = async () => {
    if (!webhookInput) {
      showToast(t('dev_toast_webhook_no_url'), "error");
      return;
    }

    setIsTestingWebhook(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/user/settings/test-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl: webhookInput })
      });
      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        showToast(t('dev_toast_webhook_test_ok'), "success");
      } else {
        showToast(t('dev_toast_webhook_test_fail'), "error");
      }
    } catch (err) {
      console.error(err);
      showToast(t('dev_toast_conn_error'), "error");
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const [baseUrl, setBaseUrl] = useState('');
  
  // Set baseUrl only on client side to avoid hydration mismatch
  useEffect(() => {
    setBaseUrl(`${window.location.protocol}//${window.location.host}`);
  }, []);

  const getBaseUrl = () => baseUrl || 'https://onaytr.com';

  const currentTokenPlaceholder = apiToken || "YOUR_API_TOKEN";


  const d = (light: string, dark: string) => isDark ? dark : light;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-800 dark:text-[#E6EDF3] display-font flex items-center gap-3">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center border shadow-xs ${d('bg-indigo-50 border-indigo-100 text-[#4648d4]', 'bg-indigo-950/20 border-indigo-900/30 text-indigo-450')}`}>
              <Terminal className="h-5.5 w-5.5" />
            </div>
            {t('dev_title')}
          </h1>
          <p className="text-slate-505 dark:text-[#8B949E] font-medium mt-2 text-sm">
            {t('dev_desc')}
          </p>
        </div>
      </div>

      {/* API Key and Webhook URL Forms */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* API Key Box */}
        <div className={`backdrop-blur-xl border rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${d('bg-white/60 border-white/40 shadow-lg', 'bg-[#161B22]/90 border-[#30363D] shadow-xl')}`}>
          <div className="text-left">
            <h2 className="text-lg font-black text-slate-805 dark:text-[#E6EDF3] mb-2 flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-500" /> {t('dev_api_key_title')}
            </h2>
            <p className="text-xs font-semibold text-slate-400 dark:text-[#8B949E] mb-4">
              {t('dev_api_key_desc')}
            </p>

            <div className="flex gap-2 items-center relative">
              <input
                type={showToken ? "text" : "password"}
                readOnly
                value={apiToken || t('dev_key_placeholder')}
                className={`w-full border rounded-xl px-3.5 py-3 text-xs font-mono select-all pr-10 focus:outline-none focus:border-indigo-500 transition-all ${d('bg-slate-50 border-slate-200 text-slate-850', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3]')}`}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-650 dark:hover:text-[#E6EDF3] transition-colors"
                title={showToken ? t('db_durum_pending') : t('db_tamamla')}
              >
                {showToken ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-[#30363D]/60">
            <button
              onClick={handleCopyToken}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#4648d4] to-[#712ae2] hover:from-[#3b3db8] hover:to-[#5e22be] text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:scale-[1.01]"
            >
              {copiedToken ? <Check className="h-4.5 w-4.5" /> : <Copy className="h-4.5 w-4.5" />}
              {t('dev_copy_key')}
            </button>
            <button
              onClick={handleRegenerateToken}
              disabled={isGeneratingToken}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border disabled:opacity-50 hover:scale-[1.01] ${d('bg-white hover:bg-slate-50 border-slate-200 text-slate-700', 'bg-[#21262D] hover:bg-[#30363D] border-[#30363D] text-[#E6EDF3]')}`}
            >
              <RefreshCw className={`h-4 w-4 ${isGeneratingToken ? "animate-spin" : ""}`} />
              {apiToken ? t('dev_refresh_key') : t('dev_create_key')}
            </button>
          </div>
        </div>

        {/* Webhook Configuration Box */}
        <div className={`backdrop-blur-xl border rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${d('bg-white/60 border-white/40 shadow-lg', 'bg-[#161B22]/90 border-[#30363D] shadow-xl')}`}>
          <div className="text-left">
            <h2 className="text-lg font-black text-slate-805 dark:text-[#E6EDF3] mb-2 flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-500" /> {t('dev_webhook_title')}
            </h2>
            <p className="text-xs font-semibold text-slate-400 dark:text-[#8B949E] mb-4">
              {t('dev_webhook_desc')}
            </p>

            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="https://siteniz.com/api/webhook"
                value={webhookInput}
                onChange={(e) => setWebhookInput(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-3 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-all ${d('bg-slate-50 border-slate-200 text-slate-850', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3]')}`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-[#30363D]/60">
            <div className="flex gap-2">
              <button
                onClick={handleSaveWebhook}
                disabled={isSavingWebhook}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#4648d4] to-[#712ae2] hover:from-[#3b3db8] hover:to-[#5e22be] text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 hover:scale-[1.01]"
              >
                {t('dev_save')}
              </button>
              <button
                onClick={handleTestWebhook}
                disabled={isTestingWebhook}
                className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border disabled:opacity-50 hover:scale-[1.01] ${d('bg-white hover:bg-slate-50 border-slate-200 text-slate-700', 'bg-[#21262D] hover:bg-[#30363D] border-[#30363D] text-[#E6EDF3]')}`}
              >
                <Send className="h-3.5 w-3.5" /> {t('dev_test')}
              </button>
            </div>
            {webhookUrl && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-250 dark:border-emerald-900/50">
                {t('dev_active')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Webhook Test Result Display */}
      {testResult && (
        <div className={`p-4 border rounded-2xl shadow-sm text-xs font-mono text-left ${
          testResult.success 
            ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300"
            : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300"
        }`}>
          <div className="font-bold mb-2 flex items-center justify-between">
            <span>{t('dev_test_result')}:</span>
            <span className="font-semibold px-2 py-0.5 rounded bg-white/60 dark:bg-black/20">
              {testResult.success ? `200 OK (${testResult.status})` : `${t('dev_error_status')} ${testResult.status || t('dev_error_no_conn')})`}
            </span>
          </div>
          {testResult.success ? (
            <div>
              <p className="mb-1"><strong>{t('dev_server_response')}:</strong></p>
              <pre className="p-2 bg-white/40 dark:bg-black/10 rounded overflow-x-auto text-[11px] font-mono whitespace-pre-wrap">{testResult.responseBody || t('dev_empty_response')}</pre>
            </div>
          ) : (
            <div>
              <p><strong>{t('dev_doc_check_important')}</strong> {testResult.error || `${t('dev_error_no_conn')}.`}</p>
            </div>
          )}
        </div>
      )}

      {/* Documentation Section Header */}
      <div>
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2 border-b pb-2 text-left text-slate-800 dark:text-[#E6EDF3] dark:border-[#30363D]/65">
          <BookOpen className="h-5 w-5 text-indigo-500" /> {t('dev_doc_title')}
        </h2>
        <p className="text-xs font-semibold text-slate-400 dark:text-[#8B949E] text-left">
          {t('dev_doc_desc')}
        </p>
      </div>

      {/* Interactive API Docs Layout */}
      <div className={`overflow-hidden border rounded-3xl flex flex-col md:flex-row transition-all duration-300 ${d('bg-white/60 border-white/40 shadow-lg', 'bg-[#161B22]/90 border-[#30363D] shadow-xl')}`}>
        {/* Navigation Sidebar */}
        <div className={`w-full md:w-64 border-r shrink-0 ${d('border-slate-100 bg-slate-50/20', 'border-[#30363D] bg-[#0D1117]/10')}`}>
          <ul className="divide-y divide-slate-100 dark:divide-[#30363D]/45">
            {[
              { id: "balance", title: t("dev_tab_balance"), method: "GET", path: "/api/v1/balance" },
              { id: "services", title: t("dev_tab_services"), method: "GET", path: "/api/v1/services" },
              { id: "pricing", title: t("dev_tab_pricing"), method: "GET", path: "/api/v1/pricing" },
              { id: "buy", title: t("dev_tab_buy"), method: "POST", path: "/api/v1/buy" },
              { id: "check", title: t("dev_tab_check"), method: "GET", path: "/api/v1/check" },
              { id: "webhook", title: t("dev_tab_webhook"), method: "POST", path: "Webhook URL" }
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full text-left px-4 py-3.5 flex flex-col gap-1 transition-all ${
                    activeTab === item.id 
                      ? "bg-indigo-50/50 dark:bg-indigo-950/10 border-l-4 border-indigo-500" 
                      : "hover:bg-slate-100/50 dark:hover:bg-[#21262D]/35 border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-800 dark:text-[#E6EDF3]">{item.title}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                      item.method === "GET" 
                        ? "bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40" 
                        : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40"
                    }`}>
                      {item.method}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-[#8B949E] truncate">{item.path}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Content Panel */}
        <div className="flex-1 p-6 overflow-x-hidden text-left">
          {activeTab === "balance" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black text-slate-805 dark:text-[#E6EDF3] flex items-center gap-1.5">
                  {t('dev_doc_balance_title')}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-[#8B949E] mt-1">
                  {t('dev_doc_balance_desc')}
                </p>
              </div>

              {/* Endpoint Specs */}
              <div className={`p-3 rounded border font-mono text-xs space-y-1 ${d('bg-slate-50 border-slate-205 text-slate-800', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3]')}`}>
                <div><span className="font-black text-sky-600 dark:text-sky-405">GET</span> {getBaseUrl()}/api/v1/balance</div>
              </div>

              {/* Request Example */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-[#E6EDF3] mb-2 flex items-center gap-1.5"><Terminal className="h-4 w-4 text-indigo-500" /> {t('dev_req_example')}</h4>
                <div className="relative">
                  <pre className="p-3 bg-[#0D1117] text-[#E6EDF3] rounded-2xl overflow-x-auto text-[11px] font-mono whitespace-pre custom-scrollbar">
{`curl -X GET "${getBaseUrl()}/api/v1/balance?apiToken=${currentTokenPlaceholder}"`}
                  </pre>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`curl -X GET "${getBaseUrl()}/api/v1/balance?apiToken=${apiToken || 'YOUR_API_TOKEN'}"`);
                      showToast(t('dev_toast_cmd_copied'), "success");
                    }} 
                    className="absolute top-2 right-2 p-2 bg-slate-850 hover:bg-slate-750 text-[#8B949E] hover:text-white rounded-xl transition-colors cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Response Example */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-[#E6EDF3] mb-2 flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-indigo-500" /> {t('dev_res_example')}</h4>
                <pre className="p-3 bg-[#0D1117] text-emerald-400 rounded-2xl overflow-x-auto text-[11px] font-mono whitespace-pre custom-scrollbar">
{`{
  "success": true,
  "email": "user@siteniz.com",
  "balance": 152.84,
  "tierLevel": "GOLD"
}`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "services" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black text-slate-805 dark:text-[#E6EDF3]">
                  {t('dev_doc_services_title')}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-[#8B949E] mt-1">
                  {t('dev_doc_services_desc')}
                </p>
              </div>

              {/* Endpoint Specs */}
              <div className={`p-3 rounded border font-mono text-xs space-y-1 ${d('bg-slate-50 border-slate-205 text-slate-800', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3]')}`}>
                <div><span className="font-black text-sky-600 dark:text-sky-405">GET</span> {getBaseUrl()}/api/v1/services</div>
              </div>

              {/* Request Example */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-[#E6EDF3] mb-2 flex items-center gap-1.5"><Terminal className="h-4 w-4 text-indigo-500" /> {t('dev_req_example')}</h4>
                <div className="relative">
                  <pre className="p-3 bg-[#0D1117] text-[#E6EDF3] rounded-2xl overflow-x-auto text-[11px] font-mono whitespace-pre custom-scrollbar">
{`curl -X GET "${getBaseUrl()}/api/v1/services" \\
  -H "Authorization: Bearer ${currentTokenPlaceholder}"`}
                  </pre>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`curl -X GET "${getBaseUrl()}/api/v1/services" -H "Authorization: Bearer ${apiToken || 'YOUR_API_TOKEN'}"`);
                      showToast(t('dev_toast_cmd_copied'), "success");
                    }} 
                    className="absolute top-2 right-2 p-2 bg-slate-850 hover:bg-slate-750 text-[#8B949E] hover:text-white rounded-xl transition-colors cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Response Example */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-[#E6EDF3] mb-2 flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-indigo-500" /> {t('dev_res_example')}</h4>
                <pre className="p-3 bg-[#0D1117] text-emerald-400 rounded-2xl overflow-x-auto text-[11px] font-mono whitespace-pre custom-scrollbar">
{`{
  "success": true,
  "services": [
    {
      "code": "whatsapp",
      "name": "WhatsApp",
      "logoUrl": "https://upload.wikimedia.org/wikipedia/commons..."
    },
    {
      "code": "telegram",
      "name": "Telegram",
      "logoUrl": null
    }
  ]
}`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black text-slate-805 dark:text-[#E6EDF3]">
                  {t('dev_doc_pricing_title')}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-[#8B949E] mt-1">
                  {t('dev_doc_pricing_desc')}
                </p>
              </div>

              {/* Endpoint Specs */}
              <div className={`p-3 rounded border font-mono text-xs space-y-1 ${d('bg-slate-50 border-slate-205 text-slate-805', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3]')}`}>
                <div><span className="font-black text-sky-600 dark:text-sky-405">GET</span> {getBaseUrl()}/api/v1/pricing</div>
                <div className="pt-2 text-[10px] text-slate-400 dark:text-[#8B949E]">
                  <strong className="text-slate-600 dark:text-[#E6EDF3]">{t('dev_doc_pricing_params')}</strong>
                  <ul className="list-disc pl-4 mt-0.5">
                    <li>{t('dev_doc_pricing_param1')}</li>
                    <li>{t('dev_doc_pricing_param2')}</li>
                  </ul>
                </div>
              </div>

              {/* Request Example */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-[#E6EDF3] mb-2 flex items-center gap-1.5"><Terminal className="h-4 w-4 text-indigo-500" /> {t('dev_req_example')}</h4>
                <div className="relative">
                  <pre className="p-3 bg-[#0D1117] text-[#E6EDF3] rounded-2xl overflow-x-auto text-[11px] font-mono whitespace-pre custom-scrollbar">
{`curl -X GET "${getBaseUrl()}/api/v1/pricing?service=whatsapp&country=russia&apiToken=${currentTokenPlaceholder}"`}
                  </pre>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`curl -X GET "${getBaseUrl()}/api/v1/pricing?service=whatsapp&country=russia&apiToken=${apiToken || 'YOUR_API_TOKEN'}"`);
                      showToast(t('dev_toast_cmd_copied'), "success");
                    }} 
                    className="absolute top-2 right-2 p-2 bg-slate-850 hover:bg-slate-750 text-[#8B949E] hover:text-white rounded-xl transition-colors cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Response Example */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-[#E6EDF3] mb-2 flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-indigo-500" /> {t('dev_res_example')}</h4>
                <pre className="p-3 bg-[#0D1117] text-emerald-400 rounded-2xl overflow-x-auto text-[11px] font-mono whitespace-pre custom-scrollbar">
{`{
  "success": true,
  "service": "whatsapp",
  "country": "russia",
  "pricing": [
    {
      "provider": "5sim",
      "operator": "tele2",
      "count": 1420,
      "priceTry": 7.84
    },
    {
      "provider": "herosms",
      "operator": "any",
      "count": 250,
      "priceTry": 9.50
    }
  ]
}`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "buy" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black text-slate-805 dark:text-[#E6EDF3]">
                  {t('dev_doc_buy_title')}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-[#8B949E] mt-1">
                  {t('dev_doc_buy_desc')}
                </p>
              </div>

              {/* Endpoint Specs */}
              <div className={`p-3 rounded border font-mono text-xs space-y-1 ${d('bg-slate-50 border-slate-205 text-slate-850', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3]')}`}>
                <div><span className="font-black text-emerald-600 dark:text-emerald-405">POST</span> {getBaseUrl()}/api/v1/buy</div>
                <div className="pt-2 text-[10px] text-slate-400 dark:text-[#8B949E]">
                  <strong className="text-slate-655 dark:text-[#E6EDF3]">{t('dev_body_params')}:</strong>
                  <ul className="list-disc pl-4 mt-0.5">
                    <li>{t('dev_doc_buy_param1')}</li>
                    <li>{t('dev_doc_buy_param2')}</li>
                    <li>{t('dev_doc_buy_param3')}</li>
                    <li>{t('dev_doc_buy_param4')}</li>
                  </ul>
                </div>
              </div>

              {/* Request Example */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-[#E6EDF3] mb-2 flex items-center gap-1.5"><Terminal className="h-4 w-4 text-indigo-500" /> {t('dev_req_example')}</h4>
                <div className="relative">
                  <pre className="p-3 bg-[#0D1117] text-[#E6EDF3] rounded-2xl overflow-x-auto text-[11px] font-mono whitespace-pre custom-scrollbar">
{`curl -X POST "${getBaseUrl()}/api/v1/buy?apiToken=${currentTokenPlaceholder}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "service": "whatsapp",
    "country": "russia"
  }'`}
                  </pre>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`curl -X POST "${getBaseUrl()}/api/v1/buy?apiToken=${apiToken || 'YOUR_API_TOKEN'}" -H "Content-Type: application/json" -d '{\n    "service": "whatsapp",\n    "country": "russia"\n}'`);
                      showToast(t('dev_toast_cmd_copied'), "success");
                    }} 
                    className="absolute top-2 right-2 p-2 bg-slate-850 hover:bg-slate-755 text-[#8B949E] hover:text-white rounded-xl transition-colors cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Response Example */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-[#E6EDF3] mb-2 flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-indigo-500" /> {t('dev_res_example')}</h4>
                <pre className="p-3 bg-[#0D1117] text-emerald-400 rounded-2xl overflow-x-auto text-[11px] font-mono whitespace-pre custom-scrollbar">
{`{
  "success": true,
  "order": {
    "id": "order_uuid_1049285023",
    "phoneNumber": "79012345678",
    "serviceCode": "whatsapp",
    "countryCode": "russia",
    "operatorCode": "tele2",
    "sellPrice": 7.84,
    "status": "PENDING",
    "expiresAt": "2026-07-16T22:30:00.000Z"
  },
  "newBalance": 145.00
}`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "check" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black text-slate-805 dark:text-[#E6EDF3]">
                  {t('dev_doc_check_title')}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-[#8B949E] mt-1">
                  {t('dev_doc_check_desc')}
                </p>
              </div>

              {/* Endpoints specs */}
              <div className="space-y-4">
                {/* Check */}
                <div className={`p-3 rounded border font-mono text-xs ${d('bg-slate-50 border-slate-205 text-slate-850', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3]')}`}>
                  <div className="font-bold mb-1"><span className="text-sky-600">GET</span> /api/v1/check?orderId=ID</div>
                  <div className="text-[10px] text-slate-400">{t('dev_doc_check_get_desc')}</div>
                </div>

                {/* Cancel */}
                <div className={`p-3 rounded border font-mono text-xs ${d('bg-slate-50 border-slate-205 text-slate-850', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3]')}`}>
                  <div className="font-bold mb-1"><span className="text-emerald-605">POST</span> /api/v1/cancel</div>
                  <div className="text-[10px] text-slate-400">{t('dev_doc_check_cancel_desc')}</div>
                </div>

                {/* Finish */}
                <div className={`p-3 rounded border font-mono text-xs ${d('bg-slate-50 border-slate-205 text-slate-850', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3]')}`}>
                  <div className="font-bold mb-1"><span className="text-emerald-605">POST</span> /api/v1/finish</div>
                  <div className="text-[10px] text-slate-400">{t('dev_doc_check_finish_desc')}</div>
                </div>
              </div>

              {/* Response Example for check */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-[#E6EDF3] mb-2 flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-indigo-500" /> {t('dev_doc_check_response')}</h4>
                <pre className="p-3 bg-[#0D1117] text-emerald-400 rounded-2xl overflow-x-auto text-[11px] font-mono whitespace-pre custom-scrollbar">
{`{
  "status": "PENDING",
  "smsCode": "748392"
}`}
                </pre>
                <div className={`p-2.5 border rounded-2xl text-[11px] mt-2 flex gap-2 ${d('bg-blue-50/50 border-blue-200 text-blue-800', 'bg-blue-950/20 border-blue-800/40 text-blue-300')}`}>
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>{t('dev_doc_check_important')}</strong> {t('dev_doc_check_note')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "webhook" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-black text-slate-805 dark:text-[#E6EDF3]">
                  {t('dev_doc_webhook_title')}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-[#8B949E] mt-1">
                  {t('dev_doc_webhook_desc')}
                </p>
              </div>

              {/* Webhook specs */}
              <div className={`p-3 rounded border font-mono text-xs ${d('bg-slate-50 border-slate-205 text-slate-850', 'bg-[#0D1117] border-[#30363D] text-[#E6EDF3]')}`}>
                <div><span className="font-black text-emerald-600 dark:text-emerald-405">POST</span> {t('dev_doc_webhook_user_url')}</div>
                <div className="text-[10px] text-slate-400 mt-1">Headers: `Content-Type: application/json`</div>
              </div>

              {/* Payload structure */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-[#E6EDF3] mb-2 flex items-center gap-1.5"><Info className="h-4 w-4 text-indigo-500" /> {t('dev_doc_webhook_payload')}</h4>
                <pre className="p-3 bg-[#0D1117] text-emerald-400 rounded-2xl overflow-x-auto text-[11px] font-mono whitespace-pre custom-scrollbar">
{`{
  "orderId": "order_uuid_1049285023",
  "phoneNumber": "79012345678",
  "smsCode": "847291",
  "serviceCode": "whatsapp",
  "countryCode": "russia",
  "status": "RECEIVED"
}`}
                </pre>
                <p className="text-[11px] text-slate-400 dark:text-[#8B949E] mt-2">
                  {t('dev_doc_webhook_note')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
