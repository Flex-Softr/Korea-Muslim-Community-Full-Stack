"use client";

import { useLanguage } from "@/components/providers/language-provider";
import {
  pickLocalizedFields,
  type LocaleContentMap,
} from "@/lib/i18n/content-locale";
import { stripHtmlTags } from "@/lib/utils";

type Input = {
  locale?: string | null;
  title?: string | null;
  category?: string | null;
  description?: string | null;
  excerpt?: string | null;
  localeContent?: LocaleContentMap | null;
};

type Output = {
  title: string;
  category: string;
  description: string;
  excerpt: string;
  loading: boolean;
};

/**
 * Localize CMS-backed fields from `localeContent` so cards can update instantly
 * when UI language changes without route refresh.
 */
export function useTranslatedFields(content: Input): Output {
  const { lang } = useLanguage();
  const localized = content.localeContent
    ? pickLocalizedFields(content.localeContent, lang)
    : null;

  const rawTitle = localized?.title?.trim() || content.title || "";
  const title = stripHtmlTags(rawTitle);
  const category = localized?.category?.trim() || content.category || "";
  const description = localized?.description || content.description || "";
  const rawExcerpt =
    localized?.description?.trim() || content.excerpt || description;
  const excerpt = stripHtmlTags(rawExcerpt);

  return {
    title,
    category,
    description,
    excerpt,
    loading: false,
  };
}
