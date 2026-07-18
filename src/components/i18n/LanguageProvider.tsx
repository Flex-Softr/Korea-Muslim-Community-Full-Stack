"use client";

import React from "react";
import type { i18n as I18nInstance } from "i18next";
import { I18nextProvider, useTranslation } from "react-i18next";

import { useRouter } from "next/navigation";

import { createAppI18n } from "@/i18n";
import type { Lang } from "@/lib/i18n/lang";

export type { Lang } from "@/lib/i18n/lang";

/** Dot-path keys matching `src/locales/*.json` (e.g. `common.login`). */
export type TranslationKey = string;

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Matches `i18next-browser-languagedetector` default localStorage key from older builds. */
const I18NEXT_LS_KEY = "i18nextLng";

function normalizeResolvedLang(lng: string | undefined | null): Lang {
  if (lng == null || typeof lng !== "string") return "en";
  const base = lng.split("-")[0]?.toLowerCase() ?? "en";
  if (base === "bn" || base === "bd") return "bn";
  if (base === "ko" || base === "kr") return "ko";
  return "en";
}

function writeLangCookie(code: Lang) {
  document.cookie = `lang=${code}; path=/; max-age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
}

function readStoredLangPreference(): Lang | undefined {
  if (typeof document === "undefined") return undefined;
  try {
    const match = document.cookie.match(/(?:^|;\s*)lang=([^;]*)/);
    const rawCookie = match?.[1]?.trim();
    if (rawCookie) return normalizeResolvedLang(decodeURIComponent(rawCookie));

    const ls = window.localStorage?.getItem(I18NEXT_LS_KEY);
    if (ls) return normalizeResolvedLang(ls);
  } catch {
    /* ignore */
  }
  return undefined;
}

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: Lang;
}) {
  const router = useRouter();
  const i18nRef = React.useRef<I18nInstance | null>(null);
  if (i18nRef.current === null) {
    i18nRef.current = createAppI18n(initialLang);
  }
  const i18nInstance = i18nRef.current;

  React.useEffect(() => {
    const migrateLegacyKrCookie = () => {
      const match = document.cookie.match(/(?:^|;\s*)lang=([^;]*)/);
      const raw = match?.[1]?.toLowerCase();
      if (raw === "kr") {
        writeLangCookie("ko");
        void i18nInstance.changeLanguage("ko");
      }
      if (raw === "bd") {
        writeLangCookie("bn");
        void i18nInstance.changeLanguage("bn");
      }
    };
    migrateLegacyKrCookie();

    const syncFromI18n = (lng: string) => {
      const code = normalizeResolvedLang(lng);
      
      const match = document.cookie.match(/(?:^|;\s*)lang=([^;]*)/);
      const rawCookie = match?.[1]?.trim();
      const currentCookieLang = rawCookie ? normalizeResolvedLang(decodeURIComponent(rawCookie)) : undefined;
      const hasCookie = !!rawCookie;

      if (currentCookieLang !== code) {
        writeLangCookie(code);
        if (hasCookie || code !== initialLang) {
          router.refresh();
        }
      }

      try {
        window.localStorage?.setItem(I18NEXT_LS_KEY, code);
      } catch {
        /* ignore */
      }
      document.documentElement.lang = code;
      document.documentElement.dir = "ltr";
    };

    const preferred = readStoredLangPreference();
    if (preferred && preferred !== normalizeResolvedLang(i18nInstance.language)) {
      void i18nInstance.changeLanguage(preferred);
    }

    syncFromI18n(i18nInstance.language);
    i18nInstance.on("languageChanged", syncFromI18n);
    return () => {
      i18nInstance.off("languageChanged", syncFromI18n);
    };
  }, [i18nInstance, initialLang, router]);

  return (
    <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
  );
}

type LanguageContextValue = {
  lang: Lang;
  /** Resolves after i18n + lang cookie/localStorage sync complete. */
  setLang: (nextLang: Lang) => Promise<void>;
  t: ReturnType<typeof useTranslation>["t"];
};

export function useI18n(): LanguageContextValue {
  const { t, i18n: i18nInstance } = useTranslation();
  const lang = normalizeResolvedLang(i18nInstance.language);
  const setLang = React.useCallback((nextLang: Lang) => {
    return i18nInstance.changeLanguage(nextLang).then(() => undefined);
  }, [i18nInstance]);

  return { lang, setLang, t };
}

export const useLanguage = useI18n;
