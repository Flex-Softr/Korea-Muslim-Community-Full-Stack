import "server-only";

import {
  emptyLocaleContentMap,
  type ContentLocale,
  type LocaleContentMap,
  type LocalizedTextFields,
} from "@/lib/i18n/content-locale";

/** New content: only `sourceLocale` is filled; other locales stay empty for manual editing. */
export function buildLocaleContentMapFromSource(
  sourceLocale: ContentLocale,
  source: LocalizedTextFields,
): LocaleContentMap {
  const out = emptyLocaleContentMap();
  out[sourceLocale] = {
    title: source.title.trim(),
    category: source.category.trim(),
    description: source.description.trim(),
  };
  return out;
}
