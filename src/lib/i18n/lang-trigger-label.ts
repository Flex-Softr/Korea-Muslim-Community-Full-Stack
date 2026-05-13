import type { Lang } from "@/components/providers/language-provider";

/** Short labels shown on the language dropdown trigger (navbar / dashboard). */
export const LANG_TRIGGER_SHORT: Record<Lang, string> = {
  bn: "BD",
  en: "US",
  ko: "KO",
};

export function getLangTriggerShortLabel(lang: string): string {
  if (lang === "en" || lang === "ko" || lang === "kr" || lang === "bn") {
    const normalized = lang === "kr" ? "ko" : lang;
    return LANG_TRIGGER_SHORT[normalized as Lang];
  }
  return LANG_TRIGGER_SHORT.bn;
}
