"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { useI18n } from "@/components/providers/language-provider";
import { pickLocalizedFields, type LocaleContentMap } from "@/lib/i18n/content-locale";
import { cleanHtml } from "@/lib/utils";
import { PageBanner } from "@/components/layout/page-banner";
import type { Lang } from "@/lib/i18n/lang";

type Props = {
  id: string;
  localeContent: LocaleContentMap;
  coverImage: string | null;
  dateIso: string;
  initialLang: Lang;
};

export function EpsDetailView({ id, localeContent, coverImage, dateIso, initialLang }: Props) {
  const { lang } = useI18n();
  const activeLang = lang ?? initialLang;

  const fields = useMemo(
    () => pickLocalizedFields(localeContent, activeLang),
    [localeContent, activeLang],
  );

  const date = useMemo(() => {
    try {
      return new Date(dateIso).toLocaleDateString(
        activeLang === "ko" ? "ko-KR" : activeLang === "bn" ? "bn-BD" : "en-US",
        { year: "numeric", month: "long", day: "numeric" },
      );
    } catch {
      return dateIso;
    }
  }, [dateIso, activeLang]);

  const breadcrumbs = [
    { labelKey: "nav.home", href: "/" },
    { labelKey: "breadcrumbs.eps", href: "/eps" },
    { label: fields.title },
  ];

  const showImage =
    coverImage && coverImage !== "/brand/logo.png" && coverImage.trim() !== "";

  return (
    <>
      <PageBanner
        title={fields.title}
        breadcrumbs={breadcrumbs}
      />

      <article className="border-b border-border/40 bg-muted/15 py-10 dark:bg-muted/10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Back link */}
          <Link
            href="/eps"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#2c7bb6] transition-colors hover:text-[#256fa3]"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to EPS
          </Link>

          {/* Meta row */}
          <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {fields.category && (
              <span className="inline-flex items-center gap-1.5">
                <Tag className="size-3.5" aria-hidden />
                {fields.category}
              </span>
            )}
            {fields.category && dateIso && (
              <span aria-hidden className="text-border">·</span>
            )}
            <time dateTime={dateIso} className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" aria-hidden />
              {date}
            </time>
          </div>

          {/* Title */}
          <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {fields.title}
          </h1>

          {/* Cover image */}
          {showImage && (
            <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl border border-border/80 bg-muted shadow-sm">
              <img
                src={coverImage}
                alt={fields.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Body */}
          {fields.description ? (
            <div
              className="prose prose-neutral dark:prose-invert max-w-none text-foreground leading-relaxed rich-content"
              dangerouslySetInnerHTML={{ __html: cleanHtml(fields.description) }}
            />
          ) : (
            <p className="text-muted-foreground italic">No content available for this language.</p>
          )}

          {/* Footer back link */}
          <p className="mt-12 text-sm text-muted-foreground">
            <Link
              href="/eps"
              className="font-medium text-[#2c7bb6] underline-offset-4 hover:underline"
            >
              ← Back to EPS
            </Link>
          </p>
        </div>
      </article>
    </>
  );
}