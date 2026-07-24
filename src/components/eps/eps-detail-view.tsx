"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { ParentModuleSidebar } from "@/components/layout/parent-module-sidebar";
import { PageBanner } from "@/components/layout/page-banner";
import { useI18n } from "@/components/providers/language-provider";
import {
  pickLocalizedFields,
  type LocaleContentMap,
} from "@/lib/i18n/content-locale";
import type { Lang } from "@/lib/i18n/lang";
import {
  resolveParentModule,
  tabHref,
} from "@/lib/module-sections/config";
import { cleanHtml } from "@/lib/utils";

type Props = {
  category: string;
  localeContent: LocaleContentMap;
  coverImage: string | null;
  dateIso: string;
  initialLang: Lang;
};

export function EpsDetailView({
  category,
  localeContent,
  coverImage,
  dateIso,
  initialLang,
}: Props) {
  const { lang } = useI18n();
  const activeLang = lang ?? initialLang;

  const fields = useMemo(
    () => pickLocalizedFields(localeContent, activeLang),
    [localeContent, activeLang],
  );

  const parent = resolveParentModule(category || fields.category || "EPS - Form");
  const backHref = parent
    ? tabHref(parent.module.basePath, parent.activeTabKey)
    : "/eps";

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
    { labelKey: "breadcrumbs.eps", href: backHref },
    { label: fields.title },
  ];

  const showImage =
    coverImage && coverImage !== "/brand/logo.png" && coverImage.trim() !== "";

  return (
    <>
      <PageBanner title={fields.title} breadcrumbs={breadcrumbs} />

      <div className="border-b border-border/40 bg-muted/15 py-10 dark:bg-muted/10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <ParentModuleSidebar
                category={category || fields.category || "EPS - Form"}
                selectId="eps-detail-tab-select"
              />
            </aside>

            <article className="min-w-0">
              <Link
                href={backHref}
                className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#2c7bb6] transition-colors hover:text-[#256fa3]"
              >
                <ArrowLeft className="size-4" aria-hidden />
                Back to EPS
              </Link>

              <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {fields.category && (
                  <span className="inline-flex items-center gap-1.5">
                    <Tag className="size-3.5" aria-hidden />
                    {fields.category}
                  </span>
                )}
                {fields.category && dateIso ? (
                  <span aria-hidden className="text-border">
                    ·
                  </span>
                ) : null}
                <time
                  dateTime={dateIso}
                  className="inline-flex items-center gap-1.5"
                >
                  <Calendar className="size-3.5" aria-hidden />
                  {date}
                </time>
              </div>

              <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {fields.title}
              </h1>

              {showImage ? (
                <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl border border-border/80 bg-muted shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt={fields.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}

              {fields.description ? (
                <div
                  className="prose prose-neutral dark:prose-invert max-w-none leading-relaxed text-foreground rich-content"
                  dangerouslySetInnerHTML={{
                    __html: cleanHtml(fields.description),
                  }}
                />
              ) : (
                <p className="italic text-muted-foreground">
                  No content available for this language.
                </p>
              )}

              <p className="mt-12 text-sm text-muted-foreground">
                <Link
                  href={backHref}
                  className="font-medium text-[#2c7bb6] underline-offset-4 hover:underline"
                >
                  ← Back to EPS
                </Link>
              </p>
            </article>
          </div>
        </div>
      </div>
    </>
  );
}
