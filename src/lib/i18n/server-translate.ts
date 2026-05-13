import "server-only";

import type { Lang } from "@/lib/i18n/lang";
import translationBN from "@/locales/bn.json";
import translationEN from "@/locales/en.json";
import translationKO from "@/locales/ko.json";

import { getRequestLang } from "@/lib/i18n/server-language";

const bundles: Record<Lang, typeof translationEN> = {
  en: translationEN,
  bn: translationBN,
  ko: translationKO,
};

function getNested(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return typeof cur === "string" ? cur : undefined;
}

export function serverT(lang: Lang, key: string): string {
  const primary = getNested(bundles[lang], key);
  if (primary !== undefined) return primary;
  const fallback = getNested(bundles.en, key);
  if (fallback !== undefined) return fallback;
  return key;
}

/** Server Components / `generateMetadata`: translate using the request language cookie/header. */
export async function getServerT(): Promise<(key: string) => string> {
  const lang = await getRequestLang();
  return (key: string) => serverT(lang, key);
}
