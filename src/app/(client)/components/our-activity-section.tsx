"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ActivityNewsCard } from "@/components/activity/activity-news-card";
import { activityDetailPath, type ActivityNewsItem } from "@/data/activity-news";
import { useLanguage } from "@/components/providers/language-provider";
import { pickLocalizedFields } from "@/lib/i18n/content-locale";
import { cn } from "@/lib/utils";
import { stripHtmlTags } from "@/lib/utils";
export function OurActivitySection({
  embedded = false,
  secondaryItemLimit,
  sourceItems = [],
}: {
  embedded?: boolean;
  /** When set (e.g. on the home page), cap how many secondary cards appear below the featured story. */
  secondaryItemLimit?: number;
  sourceItems?: ActivityNewsItem[];
}) {
  const { t, lang } = useLanguage();
  const allItems = sourceItems;
  const featuredItem = allItems[0] ?? null;

  if (!featuredItem) {
    return (
      <section
        className={cn(
          "w-full bg-muted/25 py-12 sm:py-14 dark:bg-muted/10",
          embedded ? "pt-6 sm:pt-8" : "border-t border-border/40",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-xl border border-border/70 bg-card p-6 text-sm text-muted-foreground">
            {t("activity.sectionEmpty")}
          </div>
        </div>
      </section>
    );
  }

  const secondaryItems =
    !embedded && secondaryItemLimit != null
      ? allItems.slice(1, secondaryItemLimit + 1)
      : allItems.slice(1);

  const featuredHref = activityDetailPath(featuredItem.slug);
  const featuredLocalized = featuredItem.localeContent
    ? pickLocalizedFields(featuredItem.localeContent, lang)
    : null;
  const featuredTitle = featuredLocalized?.title || featuredItem.title;
  const featuredExcerpt =
    featuredLocalized?.description?.trim() || featuredItem.excerpt;
  const featuredCategory = featuredLocalized?.category || featuredItem.category;

  return (
    <section
      className={cn(
        "w-full bg-muted/25 py-12 sm:py-14 dark:bg-muted/10",
        embedded ? "pt-6 sm:pt-8" : "border-t border-border/40",
      )}
      aria-label={embedded ? t("activity.embeddedAria") : undefined}
      aria-labelledby={embedded ? undefined : "our-activity-heading"}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {embedded ? (
          <div className="mb-8 flex justify-end sm:mb-10">
            <Link
              href="/activity"
              className="inline-flex h-9 w-fit items-center justify-center gap-1 rounded-md bg-[#2c7bb6] px-4 text-sm font-medium text-white shadow transition-colors hover:bg-[#256fa3]"
            >
              {t("activity.viewAll")}
              <ArrowUpRight className="ms-1 size-4" aria-hidden />
            </Link>
          </div>
        ) : (
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <h2
                id="our-activity-heading"
                className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                {t("activity.homeHeading")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                {t("pages.activity.subtitle")}
              </p>
            </div>
            <Link
              href="/activity"
              className="inline-flex h-9 w-fit items-center justify-center gap-1 rounded-md bg-[#2c7bb6] px-4 text-sm font-medium text-white shadow transition-colors hover:bg-[#256fa3]"
            >
              {t("activity.viewAll")}
              <ArrowUpRight className="ms-1 size-4" aria-hidden />
            </Link>
          </div>
        )}

        <article className="mb-10 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm ring-1 ring-black/[0.04] dark:ring-white/5">
          <div className="grid lg:grid-cols-2">
            <Link
              href={featuredHref}
              className="relative aspect-[16/10] min-h-[200px] bg-muted lg:aspect-auto lg:min-h-[280px]"
            >
              <Image
                src={featuredItem.imageSrc}
                alt={featuredTitle}
                fill
                className="object-cover transition duration-500 hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </Link>
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                <time dateTime={featuredItem.dateIso ?? undefined}>
                  {featuredItem.date}
                </time>
                <span className="text-border">·</span>
                <Badge variant="secondary" className="font-normal">
                  {featuredCategory}
                </Badge>
              </div>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                <Link
                  href={featuredHref}
                  className="transition-colors hover:text-[#2c7bb6] dark:hover:text-sky-400"
                >
                  {featuredTitle}
                </Link>
              </h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {stripHtmlTags(featuredExcerpt)}
              </p>
              <Link
                href={featuredHref}
                className="mt-6 inline-flex w-fit items-center gap-1 text-sm font-semibold text-[#2c7bb6] dark:text-sky-400"
              >
                {t("activity.continueReading")}
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </article>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {secondaryItems.map((item) => (
            <ActivityNewsCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
