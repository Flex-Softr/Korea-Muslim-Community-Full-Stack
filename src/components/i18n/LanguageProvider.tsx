"use client";

import React from "react";
import { dictionary } from "@/lib/i18n/dictionary";

export type Lang = "bn" | "en" | "kr";
export type TranslationKey = keyof (typeof dictionary)["en"];

type LanguageContextValue = {
  lang: Lang;
  setLang: (nextLang: Lang) => void;
  t: (key: TranslationKey, overrideLang?: Lang) => string;
};

const DEFAULT_LANG: Lang = "bn";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
export const DICT = dictionary;

const LanguageContext = React.createContext<LanguageContextValue | undefined>(undefined);

function normalizeLang(raw: string | null | undefined): Lang | null {
  if (!raw) return null;
  const value = raw.trim().toLowerCase();
  if (value === "bn") return "bn";
  if (value === "en") return "en";
  if (value === "kr" || value === "kor" || value === "ko") return "kr";
  return null;
}

function readLangFromCookie(): Lang | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)lang=([^;]*)/);
  const rawValue = match?.[1];
  if (!rawValue) return null;
  return normalizeLang(decodeURIComponent(rawValue));
}

function updateDocumentDirection(lang: string) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Keep initial SSR/client render identical to avoid hydration mismatches.
  const [lang, setLangState] = React.useState<Lang>(DEFAULT_LANG);

  React.useEffect(() => {
    const cookieLang = readLangFromCookie();
    if (cookieLang && cookieLang !== lang) {
      setLangState(cookieLang);
    }
  }, [lang]);

  React.useEffect(() => {
    updateDocumentDirection(lang);
  }, [lang]);

  const setLang = React.useCallback((nextLang: Lang) => {
    setLangState(nextLang);
    if (typeof document !== "undefined") {
      document.cookie = `lang=${nextLang}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
    }
    updateDocumentDirection(nextLang);
  }, []);

  const t = React.useCallback(
    (key: TranslationKey, overrideLang?: Lang) => {
      const activeLang = overrideLang ?? lang;
      const entry = DICT[activeLang]?.[key];
      if (entry) return entry;
      return DICT.en[key] ?? DICT.bn[key] ?? String(key);
    },
    [lang],
  );

  const value = React.useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n(): LanguageContextValue {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useI18n must be used within LanguageProvider");
  }
  return ctx;
}

export const useLanguage = useI18n;
