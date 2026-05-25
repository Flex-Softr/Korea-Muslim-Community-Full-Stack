"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ActivityCategoryFilter } from "@/components/activity/activity-category-filter";
import { useLanguage } from "@/components/providers/language-provider";
import { DataPagination } from "@/components/ui/pagination";
import type { ActivityNewsItem } from "@/data/activity-news";

const PAGE_SIZE = 8;

export function ArticleNewsListing({
  items,
  basePath,
}: {
  items: ActivityNewsItem[];
  basePath: "/article" | "/news";
}) {
  const { t } = useLanguage();
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
        {pageItems.length > 0 ? (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pageItems.map((item) => (
              <li key={item.id}>
                <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  <Link href={`${basePath}/${item.slug}`} className="flex h-full flex-col">
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                      <Image
                        src={item.imageSrc}
                        alt=""
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                      <h3 className="mt-2 line-clamp-2 text-lg font-semibold group-hover:text-[#2c7bb6]">
                        {item.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{item.excerpt}</p>
                      <span className="mt-4 text-sm font-semibold text-[#2c7bb6]">{t("common.readMore")}</span>
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
