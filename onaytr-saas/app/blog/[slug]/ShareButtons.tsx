"use client";

import { useState } from "react";
import { Send, Link2, Check } from "lucide-react";

export default function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(title)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  return (
    <div className="flex flex-row lg:flex-col gap-2">
      {/* Copy Link Button */}
      <button
        onClick={handleCopyLink}
        className={`flex items-center justify-center lg:justify-start gap-2.5 px-4 py-2.5 border rounded-xl text-xs font-bold transition-all relative overflow-hidden shrink-0 ${
          copied 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
            : "bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
        }`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-[11px]">Kopyalandı!</span>
          </>
        ) : (
          <>
            <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-[11px]">Linki Kopyala</span>
          </>
        )}
      </button>

      {/* Twitter Share */}
      <button
        onClick={handleTwitterShare}
        className="flex items-center justify-center lg:justify-start gap-2.5 px-4 py-2.5 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shrink-0 animate-all"
      >
        <svg className="w-4 h-4 text-slate-800 dark:text-white shrink-0 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span className="text-[11px] hidden sm:inline lg:inline">X / Twitter'da Paylaş</span>
        <span className="text-[11px] sm:hidden lg:hidden">X / Twitter</span>
      </button>

      {/* Telegram Share */}
      <button
        onClick={handleTelegramShare}
        className="flex items-center justify-center lg:justify-start gap-2.5 px-4 py-2.5 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shrink-0"
      >
        <Send className="w-4 h-4 text-[#229ED9] shrink-0" />
        <span className="text-[11px] hidden sm:inline lg:inline">Telegram'da Paylaş</span>
        <span className="text-[11px] sm:hidden lg:hidden">Telegram</span>
      </button>
    </div>
  );
}
