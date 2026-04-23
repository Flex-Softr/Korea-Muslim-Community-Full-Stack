"use client";

import { useEffect, useState } from "react";
import { useLanguage, type Lang } from "@/components/providers/language-provider";
import { translateText } from "@/lib/translate";

type Input = {
  locale?: string | null;
  title?: string | null;
  description?: string | null;
  excerpt?: string | null;
};

type Output = {
  title: string;
  description: string;
  excerpt: string;
  loading: boolean;
};

function normalizeLocale(locale?: string | null): Lang | null {
  if (locale === "en" || locale === "bn" || locale === "kr") return locale;
  if (locale === "kor" || locale === "ko") return "kr";
  return null;
}

export function useTranslatedFields(content: Input): Output {
  const { lang } = useLanguage();
  const source = normalizeLocale(content.locale) ?? "en";
  const original = {
    title: content.title ?? "",
    description: content.description ?? "",
    excerpt: content.excerpt ?? "",
  };
  const [state, setState] = useState<Pick<Output, "title" | "description" | "excerpt">>({
    title: original.title,
    description: original.description,
    excerpt: original.excerpt,
  });

  useEffect(() => {
    if (source === lang) return;

    let cancelled = false;
    void (async () => {
      const [title, description, excerpt] = await Promise.all([
        translateText(original.title, lang, source),
        translateText(original.description, lang, source),
        translateText(original.excerpt, lang, source),
      ]);
      if (cancelled) return;
      setState({ title, description, excerpt });
    })();

    return () => {
      cancelled = true;
    };
  }, [lang, original.description, original.excerpt, original.title, source]);

  if (source === lang) {
    return { ...original, loading: false };
  }
  return { ...state, loading: false };
}
