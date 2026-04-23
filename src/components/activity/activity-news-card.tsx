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
    excerpt: item.excerpt,
  });

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm ring-1 ring-black/[0.04] transition-shadow hover:shadow-md dark:ring-white/5">
      <Link
        href={activityDetailPath(item.slug)}
        className="flex h-full min-h-0 flex-col"
      >
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted">
          <Image
            src={item.imageSrc}
            alt=""
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes={imageSizes}
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <time dateTime={item.dateIso ?? undefined}>{item.date}</time>
            <span aria-hidden className="text-border">
              ·
            </span>
            <Badge variant="secondary" className="font-normal">
              {item.category}
            </Badge>
          </div>
          <h3 className="mt-2 text-base font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-[#2c7bb6] sm:text-lg">
            {translated.title}
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {translated.excerpt}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#2c7bb6] dark:text-sky-400">
            {t("common.readMore")}
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </div>
      </Link>
    </article>
  );
}
