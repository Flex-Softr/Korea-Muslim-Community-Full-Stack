"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { Badge } from "@/components/ui/badge";
import {
  activityDetailPath,
  type ActivityNewsItem,
} from "@/data/activity-news";
import { useTranslatedFields } from "@/hooks/use-translated-fields";
import { stripHtmlTags } from "@/lib/utils";

type ActivityNewsCardProps = {
  item: ActivityNewsItem;
  /** Passed to `next/image` `sizes` for responsive loading. */
  imageSizes?: string;
};

export function ActivityNewsCard({
  item,
  imageSizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: ActivityNewsCardProps) {
  const { t } = useLanguage();
  const translated = useTranslatedFields({
    locale: item.locale,
    title: item.title,
    category: item.category,
    excerpt: item.excerpt,
    localeContent: item.localeContent,
  });

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm ring-1 ring-black/[0.04] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:ring-white/5">
      <Link
        href={activityDetailPath(item.slug)}
        className="flex h-full min-h-0 flex-col"
      >
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted">
          <Image
            src={item.imageSrc}
            alt=""
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            sizes={imageSizes}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent opacity-80" />
        </div>
        <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
            <time dateTime={item.dateIso ?? undefined}>{item.date}</time>
            <span aria-hidden className="text-border">
              ·
            </span>
            <Badge variant="secondary" className="rounded-full px-2 py-0 text-[11px] font-medium">
              {translated.category}
            </Badge>
          </div>
          <h3 className="mt-2.5 line-clamp-2 text-[17px] font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-[#2c7bb6] sm:text-lg">
            {translated.title}
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground sm:line-clamp-3">
            {stripHtmlTags(translated.excerpt)}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#2c7bb6] dark:text-sky-400">
            {t("common.readMore")}
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </div>
      </Link>
    </article>
  );
}
