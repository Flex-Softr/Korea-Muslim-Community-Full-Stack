"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ActivityLatestSidebarClient } from "@/components/activity/activity-latest-sidebar-client";
import { useLanguage } from "@/components/providers/language-provider";
import {
  pickCmsDetailDisplayText,
  type CmsTextDetailSource,
} from "@/lib/cms/cms-detail-locale-source";
import { pickLocalizedFields } from "@/lib/i18n/content-locale";
import {
  hydrateActivityArticleDetail,
  type CmsDetailMainText,
} from "@/lib/api/cms-detail-hydration";
import { LocalizedDetailBanner } from "@/components/cms/localized-detail-banner";

function richTextToPlainText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Same pattern as the home hero: `localeContent` on a small serializable `source` object. */
export function ActivityArticleDetail({
  source,
  sidebarCards,
}: {
  source: CmsTextDetailSource;
  sidebarCards: CmsTextDetailSource[];
}) {
  const { lang, t } = useLanguage();
  const [detail, setDetail] = useState(source);
  const [sidebar, setSidebar] = useState(sidebarCards);
  /** Always from `GET /api/activity/[slug]?lang=` — same fields the server maps per language. */
  const [mainText, setMainText] = useState<CmsDetailMainText | null>(null);

  useEffect(() => {
    setDetail(source);
    setSidebar(sidebarCards);
    setMainText(null);
    let alive = true;
    const slug = source.slug;
    const targetLang = lang;
    void (async () => {
      try {
        const next = await hydrateActivityArticleDetail(slug, targetLang);
        if (!alive || !next) return;
        if (next.source.slug !== slug) return;
        setDetail(next.source);
        setSidebar(next.sidebarCards);
        setMainText(next.mainText);
      } catch {
        /* keep SSR + pickCmsDetailDisplayText fallback */
      }
    })();
    return () => {
      alive = false;
    };
  }, [source, sidebarCards, lang]);

  const loc = useMemo(() => {
    if (mainText) {
      const picked = pickLocalizedFields(detail.localeContent, lang);
      return {
        title: mainText.title,
        category: picked.category,
        description: mainText.description,
      };
    }
    return pickCmsDetailDisplayText(detail, lang);
  }, [mainText, detail, lang]);

  const plainContent = richTextToPlainText(loc.description);
  const paragraphs = plainContent
    .split(/(?:\r?\n){2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const excerpt = useMemo(() => {
    const plain = richTextToPlainText(loc.description);
    return plain.slice(0, 180) || loc.title;
  }, [loc]);

  const breadcrumbs = useMemo(
    () => [
      { label: t("nav.home"), href: "/" },
      { label: t("breadcrumbs.activity"), href: "/activity" },
      { label: loc.title },
    ],
    [t, loc.title],
  );

  return (
    <Fragment key={lang}>
      <LocalizedDetailBanner
        key={`banner-${lang}`}
        title={loc.title}
        subtitle={`${loc.category} · ${detail.date}`}
        breadcrumbs={breadcrumbs}
      />
      <article className="border-b border-border/40 bg-muted/15 py-10 dark:bg-muted/10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="min-w-0 lg:col-span-7 xl:col-span-8">
              <Link
                href="/activity"
                className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#2c7bb6] transition-colors hover:text-[#256fa3] dark:text-sky-400 dark:hover:text-sky-300"
              >
                <ArrowLeft className="size-4" aria-hidden />
                {t("pages.activity.archiveLink")}
              </Link>

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <time dateTime={detail.dateIso ?? undefined}>{detail.date}</time>
                <span aria-hidden className="text-border">
                  ·
                </span>
                <Badge variant="secondary" className="font-normal">
                  {loc.category}
                </Badge>
              </div>

              <div className="relative mt-6 aspect-[16/10] w-full overflow-hidden rounded-xl border border-border/80 bg-muted shadow-sm ring-1 ring-black/[0.04] dark:ring-white/5">
                <Image
                  src={detail.imageSrc}
                  alt={loc.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, min(896px, 58vw)"
                  priority
                />
              </div>

              <p className="mt-8 text-lg leading-relaxed text-muted-foreground">{excerpt}</p>

              <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground">
                {paragraphs.length > 0 ? (
                  paragraphs.map((p, i) => <p key={i}>{p}</p>)
                ) : (
                  <p>{plainContent}</p>
                )}
              </div>

              <p className="mt-10 text-sm text-muted-foreground">
                {t("pages.activity.detailFooterLead")}{" "}
                <Link
                  href="/activity"
                  className="font-medium text-[#2c7bb6] underline-offset-4 hover:underline dark:text-sky-400"
                >
                  {t("pages.activity.detailFooterLink")}
                </Link>
                .
              </p>
            </div>

            <div className="lg:col-span-5 xl:col-span-4">
              <ActivityLatestSidebarClient cards={sidebar} />
            </div>
          </div>
        </div>
      </article>
    </Fragment>
  );
}
