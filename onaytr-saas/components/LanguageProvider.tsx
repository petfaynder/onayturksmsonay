"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations, TranslationKey } from "@/lib/translations";
import { useRouter } from "next/navigation";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  supportedLangs: { tr: boolean; en: boolean; az: boolean };
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ 
  children, 
  defaultLang = "tr",
  supportedLangs = { tr: true, en: true, az: true }
}: { 
  children: React.ReactNode; 
  defaultLang?: Language;
  supportedLangs?: { tr: boolean; en: boolean; az: boolean };
}) {
  const [language, setLanguageState] = useState<Language>(defaultLang);
  const router = useRouter();

  // Load language preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("preferred_language") as Language;
    if (saved && (saved === "tr" || saved === "en" || saved === "az")) {
      setLanguageState(saved);
      document.cookie = `preferred_language=${saved}; path=/; max-age=31536000; SameSite=Lax`;
      router.refresh();
    }
  }, [router]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("preferred_language", lang);
    document.cookie = `preferred_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  // Translation helper function
  const t = (key: TranslationKey): string => {
    const dict = translations[language] || translations["tr"];
    return (dict as any)[key] || (translations["tr"] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, supportedLangs }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
