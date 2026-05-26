"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { ActivityCategoryFilter } from "@/components/activity/activity-category-filter";
import { useLanguage } from "@/components/providers/language-provider";
import { Badge } from "@/components/ui/badge";
import { DataPagination } from "@/components/ui/pagination";
import type { ActivityNewsItem } from "@/data/activity-news";
import { pickLocalizedFields } from "@/lib/i18n/content-locale";
import { stripHtmlTags } from "@/lib/utils";

const PAGE_SIZE = 8;

export function ArticleNewsListing({
  items,
  basePath,
}: {
  items: ActivityNewsItem[];
  basePath: "/article" | "/news";
}) {
  const { t, lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category))].sort((a, b) => a.localeCompare(b)),
    [items],
  );
  const filtered = useMemo(
    () => items.filter((item) => !selectedCategory || item.category === selectedCategory),
    [items, selectedCategory],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(offset, offset + PAGE_SIZE);
  const localizedPageItems = useMemo(
    () =>
      pageItems.map((item) => {
        const localized = item.localeContent
          ? pickLocalizedFields(item.localeContent, lang)
          : null;

        return {
          ...item,
          title: localized?.title?.trim() || item.title,
          category: localized?.category?.trim() || item.category,
          excerpt: localized?.description?.trim() || item.excerpt,
        };
      }),
    [pageItems, lang],
  );

  return (
    <div className="border-b border-border/40 bg-muted/25 py-10 dark:bg-muted/10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ActivityCategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(category) => {
            setSelectedCategory(category);
            setPage(1);
          }}
          className="mb-8 sm:mb-10"
        />
        {localizedPageItems.length > 0 ? (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {localizedPageItems.map((item) => (
              <li key={item.id}>
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm ring-1 ring-black/[0.04] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:ring-white/5">
                  <Link href={`${basePath}/${item.slug}`} className="flex h-full flex-col">
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                      <Image
                        src={item.imageSrc}
                        alt={item.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent opacity-80" />
                    </div>
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
                        <time dateTime={item.dateIso ?? undefined}>{item.date}</time>
                        <span aria-hidden className="text-border">
                          ·
                        </span>
                        <Badge variant="secondary" className="rounded-full px-2 py-0 text-[11px] font-medium">
                          {item.category}
                        </Badge>
                      </div>
                      <h3 className="mt-2.5 line-clamp-2 text-[17px] font-semibold leading-snug tracking-tight transition-colors group-hover:text-[#2c7bb6] sm:text-lg">
                        {item.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground sm:line-clamp-3">
                        {stripHtmlTags(item.excerpt)}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#2c7bb6] dark:text-sky-400">
                        {t("common.readMore")}
                        <ArrowUpRight className="size-4" aria-hidden />
                      </span>
                    </div>
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No items found.</p>
        )}
        {filtered.length > 0 && totalPages > 1 ? (
          <DataPagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-10"
            ariaLabel="List pagination"
            showSummary
            align="center"
          />
        ) : null}
      </div>
    </div>
  );
}
