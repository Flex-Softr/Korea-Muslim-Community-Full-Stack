import {
  legacyLocaleMapFromFlat,
  pickLocalizedFields,
  type LocalizedTextFields,
  type LocaleContentMap,
} from "@/lib/i18n/content-locale";
import type { Lang } from "@/lib/i18n/lang";

/**
 * Minimal payload for client detail pages — mirrors the home `HeroCarouselSource` pattern:
 * `localeContent` stays nested so RSC → client serialization matches the home hero.
 */
export type CmsTextDetailSource = {
  id: string;
  slug: string;
  imageSrc: string;
  dateIso?: string;
  date: string;
  localeContent: LocaleContentMap;
  /**
   * When set, `resolvedTitle` / `resolvedCategory` / `resolvedDescription` are the API/RSC
   * row flattened for `resolvedForLang` (reliable when `localeContent` is missing or a
   * legacy duplicate map on the client).
   */
  resolvedForLang?: Lang;
  resolvedTitle?: string;
  resolvedCategory?: string;
  resolvedDescription?: string;
};

export function toCmsTextDetailSource(input: {
  id: string;
  slug: string;
  imageSrc: string;
  dateIso?: string;
  date: string;
  title: string;
  category: string;
  body: string;
  localeContent?: LocaleContentMap | null;
  /** Tag flattened `title` / `category` / `body` as belonging to this UI language. */
  resolvedForLang?: Lang;
}): CmsTextDetailSource {
  const localeContent =
    input.localeContent ?? legacyLocaleMapFromFlat(input.title, input.category, input.body);
  const base: CmsTextDetailSource = {
    id: input.id,
    slug: input.slug,
    imageSrc: input.imageSrc,
    dateIso: input.dateIso,
    date: input.date,
    localeContent,
  };
  if (input.resolvedForLang != null) {
    base.resolvedForLang = input.resolvedForLang;
    base.resolvedTitle = input.title;
    base.resolvedCategory = input.category;
    base.resolvedDescription = input.body;
  }
  return base;
}

/** Main column: prefer API-flattened copy for the active language, else `localeContent`. */
export function pickCmsDetailDisplayText(source: CmsTextDetailSource, lang: Lang): LocalizedTextFields {
  if (
    source.resolvedForLang === lang &&
    source.resolvedTitle != null &&
    (source.resolvedTitle.trim() !== "" ||
      (source.resolvedDescription?.trim() ?? "") !== "")
  ) {
    return {
      title: source.resolvedTitle,
      category: source.resolvedCategory ?? "",
      description: source.resolvedDescription ?? "",
    };
  }
  return pickLocalizedFields(source.localeContent, lang);
}
