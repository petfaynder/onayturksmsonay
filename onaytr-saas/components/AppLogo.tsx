"use client";

import { useState, useEffect } from 'react';
import { getSimpleIconUrl } from '@/lib/utils/icons';
import { Gamepad2, MessageSquare, CreditCard, Shield, Globe, Sparkles } from 'lucide-react';

interface AppLogoProps {
  name: string;
  className?: string;
}

// Some services have non-.com domains — map the exceptions here
const domainOverrides: Record<string, string> = {
  'telegram': 'telegram.org',
  'vkontakte': 'vk.com',
  'vk': 'vk.com',
  'github': 'github.com',
  'gitlab': 'gitlab.com',
  'duckduckgo': 'duckduckgo.com',
  'protonmail': 'proton.me',
  'proton': 'proton.me',
  'signal': 'signal.org',
  'whatsapp': 'whatsapp.com',
  'youtube': 'youtube.com',
  'gmail': 'gmail.com',
  'appstore': 'apple.com',
  'playstore': 'play.google.com',
  'googleplay': 'play.google.com',
  'hopi': 'hopi.com.tr',
  'imo': 'imo.im',
  'easypay': 'easypay.ua',
};

const SKIP_FAVICON_SERVICES = new Set([
  'other', 'diğer', 'diger', 'any', 'hepsi', 'tüm'
]);

function getGoogleFaviconUrl(name: string): string {
  const domain = domainOverrides[name] || `${name}.com`;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

const LOCAL_SERVICES = new Set([
  '1win', '1xbet', 'azar', 'bigolive', 'getir',
  'hepsiburadacom', 'letgo', 'papara', 'sahibinden',
  'tosla', 'trendyol', 'yemeksepeti'
]);

// Stage tracker: 0 = local, 1 = simpleicons, 2 = google favicons, 3 = error
type Stage = 0 | 1 | 2 | 3;

export default function AppLogo({ name, className = "h-10 w-10" }: AppLogoProps) {
  const cleanName = name.toLowerCase().trim();
  const hasLocal = LOCAL_SERVICES.has(cleanName);
  const initialStage: Stage = hasLocal ? 0 : 1;

  const [stage, setStage] = useState<Stage>(initialStage);

  // Reset when name changes
  useEffect(() => {
    setStage(hasLocal ? 0 : 1);
  }, [name, cleanName, hasLocal]);

  const getSrc = (s: Stage): string => {
    if (s === 0) return `/services/${cleanName}.svg`;
    if (s === 1) return getSimpleIconUrl(cleanName);
    if (s === 2) return getGoogleFaviconUrl(cleanName);
    return '';
  };

  const handleImageError = () => {
    setStage((prev) => {
      if (prev === 0) return 1;
      if (prev === 1) {
        if (SKIP_FAVICON_SERVICES.has(cleanName)) return 3;
        return 2;
      }
      return 3;
    });
  };

  // Determine category and styling for fallback
  const startsWithNumber = /^[0-9]/.test(cleanName);
  const firstChar = name.charAt(0).toUpperCase();

  let FallbackIcon = Globe;
  let gradientClass = "from-teal-400 via-teal-600 to-emerald-600";

  if (/bet|casino|win|lucky|game|play|sport|poker|jackpot|slots|arcade|rummy|vip/i.test(cleanName)) {
    FallbackIcon = Gamepad2;
    gradientClass = "from-indigo-500 via-purple-500 to-pink-500";
  } else if (/chat|mail|messenger|talk|message|social|connect|vibe/i.test(cleanName)) {
    FallbackIcon = MessageSquare;
    gradientClass = "from-sky-400 via-blue-500 to-indigo-600";
  } else if (/pay|card|wallet|bank|cash|market|shop|store|reward|coin|gold|dollar|money/i.test(cleanName)) {
    FallbackIcon = CreditCard;
    gradientClass = "from-emerald-400 via-teal-500 to-cyan-600";
  } else if (/vpn|proxy|shield|secure|protect|lock|auth|key|verify/i.test(cleanName)) {
    FallbackIcon = Shield;
    gradientClass = "from-slate-600 to-slate-800";
  } else if (startsWithNumber) {
    FallbackIcon = Sparkles;
    gradientClass = "from-amber-400 via-orange-500 to-rose-500";
  } else {
    FallbackIcon = Sparkles;
    gradientClass = "from-teal-500 via-teal-600 to-emerald-600";
  }

  if (stage === 3) {
    return (
      <div className={`${className} shrink-0 rounded-xl bg-gradient-to-br ${gradientClass} shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center text-white select-none`}>
        {startsWithNumber ? (
          <FallbackIcon className="h-5 w-5 text-white/90 drop-shadow-sm" />
        ) : (
          <span className="font-black text-[15px] tracking-wider drop-shadow-sm">{firstChar}</span>
        )}
      </div>
    );
  }

  return (
    <div className={`${className} shrink-0 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center p-2 transition-all relative overflow-hidden group`}>
      <img
        key={stage} // force re-render when src changes
        src={getSrc(stage)}
        alt={name}
        loading="lazy"
        className="w-full h-full object-contain filter group-hover:scale-105 transition-transform"
        onError={handleImageError}
      />
    </div>
  );
}
