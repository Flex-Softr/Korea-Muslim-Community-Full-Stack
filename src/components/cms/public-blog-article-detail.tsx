"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PublicBlogComments } from "@/components/blog/public-blog-comments";
import { useLanguage } from "@/components/providers/language-provider";
import type { CmsTextDetailSource } from "@/lib/cms/cms-detail-locale-source";
import { hydratePublicBlogArticleDetail } from "@/lib/api/cms-detail-hydration";
import { pickLocalizedFields } from "@/lib/i18n/content-locale";
import { LocalizedDetailBanner } from "@/components/cms/localized-detail-banner";

export function PublicBlogArticleDetail({
  source,
  dateLabel: initialDateLabel,
  showHeroImage: initialShowHeroImage,
  authorName: initialAuthorName,
  slug,
  canComment,
}: {
  source: CmsTextDetailSource;
  dateLabel: string;
  showHeroImage: boolean;
  authorName: string;
  slug: string;
  canComment: boolean;
}) {
  const { lang, t } = useLanguage();
  const [detail, setDetail] = useState(source);
  const [dateLabel, setDateLabel] = useState(initialDateLabel);
  const [showHeroImage, setShowHeroImage] = useState(initialShowHeroImage);
  const [authorName, setAuthorName] = useState(initialAuthorName);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const next = await hydratePublicBlogArticleDetail(slug);
        if (!alive || !next) return;
        setDetail(next.source);
        setDateLabel(next.dateLabel);
        setShowHeroImage(next.showHeroImage);
        setAuthorName(next.authorName);
      } catch {
        /* keep SSR props */
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  const loc = useMemo(
    () => pickLocalizedFields(detail.localeContent, lang),
    [detail.localeContent, lang],
  );

  const breadcrumbs = useMemo(
    () => [
      { label: t("nav.home"), href: "/" },
      { label: t("common.blog"), href: "/blog" },
      { label: loc.title },
    ],
    [t, loc.title],
  );

  return (
    <Fragment key={lang}>
      <LocalizedDetailBanner
        title={loc.title}
        subtitle={`${loc.category} · ${dateLabel}`}
        breadcrumbs={breadcrumbs}
      />
      <article className="border-b border-border/40 bg-muted/15 py-10 dark:bg-muted/10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#2c7bb6] transition-colors hover:text-[#256fa3] dark:text-sky-400 dark:hover:text-sky-300"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t("pages.blog.backToArchive")}
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <time dateTime={detail.dateIso}>{dateLabel}</time>
            <span aria-hidden className="text-border">
              ·
            </span>
            <Badge variant="secondary" className="font-normal">
              {loc.category}
            </Badge>
            <span aria-hidden className="text-border">
              ·
            </span>
            <span>{t("pages.blog.byline", { name: authorName })}</span>
          </div>

          {showHeroImage ? (
            <div className="relative mt-6 aspect-[16/10] w-full overflow-hidden rounded-xl border border-border/80 bg-muted shadow-sm ring-1 ring-black/[0.04] dark:ring-white/5">
              <Image
                src={detail.imageSrc}
                alt={loc.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>
          ) : null}

          <div
            className="prose prose-sm mt-8 max-w-none dark:prose-invert sm:prose-base"
            dangerouslySetInnerHTML={{ __html: loc.description }}
          />

          <PublicBlogComments slug={slug} canComment={canComment} />
        </div>
      </article>
    </Fragment>
  );
}
