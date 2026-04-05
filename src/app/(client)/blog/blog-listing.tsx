"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BlogArchiveCard } from "@/components/blog/blog-archive-card";
import {
  BlogArchiveSidebar,
  type YearArchiveEntry,
} from "@/components/blog/blog-archive-sidebar";
import { BlogFeaturedCard } from "@/components/blog/blog-featured-card";
import { DataPagination } from "@/components/ui/pagination";
import { postsSortedByDate } from "@/data/student-news";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

const GRID_IMAGE_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

function buildYearArchive(
  posts: ReturnType<typeof postsSortedByDate>,
): YearArchiveEntry[] {
  const byYear = new Map<number, number>();
  for (const p of posts) {
    const y = Number(p.dateIso.slice(0, 4));
    if (!Number.isFinite(y)) {
      continue;
    }
    byYear.set(y, (byYear.get(y) ?? 0) + 1);
  }
  return [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, count]) => ({ year, count }));
}

export function BlogListing() {
  const allSorted = useMemo(() => postsSortedByDate(), []);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const categories = useMemo(() => {
    const set = new Set(allSorted.map((p) => p.category));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [allSorted]);

  const yearArchive = useMemo(() => buildYearArchive(allSorted), [allSorted]);

  const hasActiveFilter =
    selectedCategory != null || selectedYear != null;

  const filtered = useMemo(() => {
    return allSorted.filter((p) => {
      if (
        selectedYear != null &&
        !p.dateIso.startsWith(String(selectedYear))
      ) {
        return false;
      }
      if (selectedCategory != null && p.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [allSorted, selectedCategory, selectedYear]);

  const { page, setPage, totalPages, offset } = usePagination({
    totalItems: (() => {
      if (!hasActiveFilter && filtered.length > 0) {
        return Math.max(0, filtered.length - 1);
      }
      return filtered.length;
    })(),
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedYear, setPage]);

  const showFeatured =
    !hasActiveFilter && page === 1 && filtered.length > 0;

  const restForPagination =
    !hasActiveFilter && filtered.length > 0
      ? filtered.slice(1)
      : filtered;

  const pageGridItems = restForPagination.slice(offset, offset + PAGE_SIZE);
  const featuredPost = showFeatured ? filtered[0] : null;

  return (
    <div
      className={cn(
        "relative border-b border-border/40 bg-gradient-to-b from-muted/35 via-background to-muted/20 dark:from-muted/15 dark:via-background dark:to-muted/10",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(44,123,182,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(56,189,248,0.08),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-8 xl:col-span-9">
            <p className="text-sm text-muted-foreground">
              {filtered.length === 0 ? (
                <>No posts match your filters.</>
              ) : (
                <>
                  <span className="font-medium text-foreground">
                    {filtered.length}
                  </span>{" "}
                  article
                  {filtered.length === 1 ? "" : "s"}
                  {hasActiveFilter ? " match your filters" : " in the archive"}
                  {pageGridItems.length > 0 || featuredPost ? (
                    <>
                      {" "}
                      ·{" "}
                      <span className="font-medium text-foreground">
                        {(featuredPost ? 1 : 0) + pageGridItems.length}
                      </span>{" "}
                      on this page
                    </>
                  ) : null}
                </>
              )}
            </p>

            {featuredPost ? (
              <div className="mt-8">
                <BlogFeaturedCard post={featuredPost} />
              </div>
            ) : null}

            {pageGridItems.length > 0 ? (
              <ul
                className={cn(
                  "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
                  featuredPost ? "mt-10" : "mt-8",
                )}
                aria-label="Blog archive"
              >
                {pageGridItems.map((post) => (
                  <li key={post.id} className="min-w-0">
                    <BlogArchiveCard
                      post={post}
                      imageSizes={GRID_IMAGE_SIZES}
                    />
                  </li>
                ))}
              </ul>
            ) : !featuredPost ? (
              <p className="mt-10 text-sm text-muted-foreground">
                Nothing here yet. Try clearing filters or check back soon.
              </p>
            ) : null}

            {restForPagination.length > 0 && totalPages > 1 ? (
              <DataPagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                className="mt-10"
                ariaLabel="Blog archive pagination"
                showSummary
                align="center"
              />
            ) : null}

            <p className="mt-12 text-sm">
              <Link
                href="/"
                className="font-medium text-[#2c7bb6] underline-offset-4 transition-colors hover:text-[#256fa3] hover:underline dark:text-sky-400 dark:hover:text-sky-300"
              >
                ← Back to home
              </Link>
            </p>
          </div>

          <div className="lg:col-span-4 xl:col-span-3">
            <BlogArchiveSidebar
              categories={categories}
              yearArchive={yearArchive}
              selectedCategory={selectedCategory}
              selectedYear={selectedYear}
              onSelectCategory={setSelectedCategory}
              onSelectYear={setSelectedYear}
              totalMatching={filtered.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
