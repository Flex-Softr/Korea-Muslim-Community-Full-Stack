import type { Lang } from "@/lib/i18n/lang";

/** Bengali script tends to read smaller at equal px; bump header nav + flyouts only. */
export function headerNavTextSizeClass(lang: Lang): string {
  return lang === "bn"
    ? "text-sm lg:text-base"
    : "text-[0.8125rem] lg:text-sm";
}
