import type { Lang } from "@/lib/i18n/lang";

/** Locales stored for dashboard CMS body copy (matches site `Lang`). */
export type ContentLocale = Lang;

export const CONTENT_LOCALES: ContentLocale[] = ["en", "ko", "bn"];

export const CONTENT_LOCALE_LABELS: Record<ContentLocale, string> = {
  en: "English",
  ko: "한국어 (Korean)",
  bn: "বাংলা (Bengali)",
};

export type LocalizedTextFields = {
  title: string;
  category: string;
  description: string;
};

export type LocaleContentMap = Record<ContentLocale, LocalizedTextFields>;

export type CarouselLocaleFields = {
  title: string;
  subtitle: string;
  ctaLabel: string;
};

export type CarouselLocaleMap = Record<ContentLocale, CarouselLocaleFields>;

function isContentLocale(v: string): v is ContentLocale {
  return v === "en" || v === "ko" || v === "bn";
}

export function normalizeContentLocale(v: string | undefined | null): ContentLocale {
  if (!v) return "en";
  const x = v.toLowerCase().trim();
  if (x === "kr") return "ko";
  if (x === "bd") return "bn";
  return isContentLocale(x) ? x : "en";
}

export function emptyLocalizedFields(): LocalizedTextFields {
  return { title: "", category: "", description: "" };
}

export function emptyLocaleContentMap(): LocaleContentMap {
  return { en: emptyLocalizedFields(), ko: emptyLocalizedFields(), bn: emptyLocalizedFields() };
}

export function emptyCarouselLocaleMap(): CarouselLocaleMap {
  const z = { title: "", subtitle: "", ctaLabel: "" };
  return { en: { ...z }, ko: { ...z }, bn: { ...z } };
}

export function parseLocaleContentMap(raw: unknown): LocaleContentMap | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const out = emptyLocaleContentMap();
  for (const loc of CONTENT_LOCALES) {
    const block = o[loc];
    if (!block || typeof block !== "object") continue;
    const b = block as Record<string, unknown>;
    const title = typeof b.title === "string" ? b.title : "";
    const category = typeof b.category === "string" ? b.category : "";
    const description = typeof b.description === "string" ? b.description : "";
    out[loc] = { title, category, description };
  }
  const blockHas = (b: LocalizedTextFields) =>
    Boolean(b.title.trim() || b.description.trim() || b.category.trim());
  if (!blockHas(out.en) && !blockHas(out.ko) && !blockHas(out.bn)) return null;
  return out;
}

export function parseCarouselLocaleMap(raw: unknown): CarouselLocaleMap | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const out = emptyCarouselLocaleMap();
  for (const loc of CONTENT_LOCALES) {
    const block = o[loc];
    if (!block || typeof block !== "object") continue;
    const b = block as Record<string, unknown>;
    out[loc] = {
      title: typeof b.title === "string" ? b.title : "",
      subtitle: typeof b.subtitle === "string" ? b.subtitle : "",
      ctaLabel: typeof b.ctaLabel === "string" ? b.ctaLabel : "",
    };
  }
  if (!out.en.title && !out.ko.title && !out.bn.title) return null;
  return out;
}

/** Prefer requested language, then English, then first non-empty title. */
export function pickLocalizedFields(
  map: LocaleContentMap,
  lang: Lang,
): LocalizedTextFields {
  const tryLang = (l: Lang): LocalizedTextFields | null => {
    const b = map[l];
    if (!b) return null;
    if (b.title.trim() || b.description.trim() || b.category.trim()) return b;
    return null;
  };
  return (
    tryLang(lang) ??
    tryLang("en") ??
    tryLang("ko") ??
    tryLang("bn") ??
    map.en ??
    emptyLocalizedFields()
  );
}

export function pickCarouselFields(map: CarouselLocaleMap, lang: Lang): CarouselLocaleFields {
  const tryLang = (l: Lang): CarouselLocaleFields | null => {
    const b = map[l];
    if (b.title.trim() || b.subtitle.trim()) return b;
    return null;
  };
  return tryLang(lang) ?? tryLang("en") ?? tryLang("ko") ?? tryLang("bn") ?? map.en;
}

/** Canonical English category for filters / URLs (falls back to any). */
export function canonicalCategory(map: LocaleContentMap): string {
  const en = map.en.category.trim();
  if (en) return en;
  return map.ko.category.trim() || map.bn.category.trim() || "General";
}

export function legacyLocaleMapFromFlat(
  title: string,
  category: string,
  description: string,
): LocaleContentMap {
  const block = { title, category, description };
  return { en: { ...block }, ko: { ...block }, bn: { ...block } };
}

export function legacyCarouselMapFromFlat(
  title: string,
  subtitle: string,
  ctaLabel: string,
): CarouselLocaleMap {
  const block = { title, subtitle, ctaLabel };
  return { en: { ...block }, ko: { ...block }, bn: { ...block } };
}
