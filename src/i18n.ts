"use client";

import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import type { Lang } from "@/lib/i18n/lang";
import translationEN from "@/locales/en.json";
import translationBN from "@/locales/bn.json";
import translationKO from "@/locales/ko.json";

const resources = {
  en: { translation: translationEN },
  bn: { translation: translationBN },
  ko: { translation: translationKO },
};

/** Browser detector runs too early for SSR; RootLayout passes `initialLang` instead. */
export function createAppI18n(initialLng: Lang) {
  const instance = i18next.createInstance();
  instance.use(initReactI18next).init({
    resources,
    lng: initialLng,
    fallbackLng: "bn",
    supportedLngs: ["en", "bn", "ko"],
    debug: false,
    interpolation: { escapeValue: false },
    defaultNS: "translation",
    ns: ["translation"],
    react: { useSuspense: false },
  });
  return instance;
}
