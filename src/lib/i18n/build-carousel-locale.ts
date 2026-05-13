import "server-only";

import {
  emptyCarouselLocaleMap,
  type ContentLocale,
  type CarouselLocaleMap,
  type CarouselLocaleFields,
} from "@/lib/i18n/content-locale";

/** New slide: only `sourceLocale` is filled; other locales stay empty for manual editing. */
export function buildCarouselLocaleMapFromSource(
  sourceLocale: ContentLocale,
  source: CarouselLocaleFields,
): CarouselLocaleMap {
  const out = emptyCarouselLocaleMap();
  out[sourceLocale] = {
    title: source.title.trim(),
    subtitle: source.subtitle.trim(),
    ctaLabel: source.ctaLabel.trim(),
  };
  return out;
}
