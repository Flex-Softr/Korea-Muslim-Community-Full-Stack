"use client";

import { useLanguage } from "@/components/providers/language-provider";
import {
  pickLocalizedFields,
  type LocaleContentMap,
} from "@/lib/i18n/content-locale";

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

  const title = localized?.title?.trim() || content.title || "";
  const category = localized?.category?.trim() || content.category || "";
  const description = localized?.description || content.description || "";
  const excerpt = localized?.description?.trim() || content.excerpt || description;

  return {
    title,
    category,
    description,
    excerpt,
    loading: false,
  };
}
