import type { Lang } from "@/components/providers/language-provider";

/** Short labels shown on the language dropdown trigger (navbar / dashboard). */
export const LANG_TRIGGER_SHORT: Record<Lang, string> = {
  bn: "BN",
  en: "Eng",
  kr: "kor",
};

export function getLangTriggerShortLabel(lang: string): string {
  if (lang === "en" || lang === "kr" || lang === "bn") {
    return LANG_TRIGGER_SHORT[lang];
  }
  return LANG_TRIGGER_SHORT.bn;
}
