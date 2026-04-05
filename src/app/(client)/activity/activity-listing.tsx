"use client";

import { useEffect, useMemo, useState } from "react";
import { ActivityCategoryFilter } from "@/components/activity/activity-category-filter";
import { ActivityNewsCard } from "@/components/activity/activity-news-card";
import { DataPagination } from "@/components/ui/pagination";
import {
  ACTIVITY_NEWS,
  getActivityListingCategories,
} from "@/data/activity-news";
import { usePagination } from "@/hooks/use-pagination";

const PAGE_SIZE = 8;

const GRID_IMAGE_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";

export function ActivityListing() {
  const categories = useMemo(() => getActivityListingCategories(), []);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (selectedCategory == null) {
      return ACTIVITY_NEWS;
    }
    return ACTIVITY_NEWS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const { page, setPage, totalPages, offset } = usePagination({
    totalItems: filtered.length,
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, setPage]);

  const pageItems = filtered.slice(offset, offset + PAGE_SIZE);

  return (
    <div className="border-b border-border/40 bg-muted/25 py-10 dark:bg-muted/10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ActivityCategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          className="mb-8 sm:mb-10"
        />

        <p className="mb-6 text-sm text-muted-foreground sm:mb-8">
          {ACTIVITY_NEWS.length === 0 ? (
            <>No stories yet.</>
          ) : filtered.length === 0 ? (
            <>
              No stories in category{" "}
              <span className="font-medium text-foreground">
                {selectedCategory}
              </span>
              . Try another category or{" "}
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="font-medium text-[#2c7bb6] underline-offset-4 hover:underline dark:text-sky-400"
              >
                show all
              </button>
              .
            </>
          ) : (
            <>
              Showing{" "}
              <span className="font-medium text-foreground">
                {offset + 1}–{offset + pageItems.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {filtered.length}
              </span>{" "}
              {filtered.length === 1 ? "story" : "stories"}
              {selectedCategory != null ? (
                <>
                  {" "}
                  in{" "}
                  <span className="font-medium text-foreground">
                    {selectedCategory}
                  </span>
                </>
              ) : null}
            </>
          )}
        </p>

        {pageItems.length > 0 ? (
          <ul
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Activity and news"
          >
            {pageItems.map((item) => (
              <li key={item.id} className="min-w-0">
                <ActivityNewsCard
                  item={item}
                  imageSizes={GRID_IMAGE_SIZES}
                />
              </li>
            ))}
          </ul>
        ) : null}

        {filtered.length > 0 && totalPages > 1 ? (
          <DataPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-10"
            ariaLabel="Activity list pagination"
            showSummary
            align="center"
          />
        ) : null}
      </div>
    </div>
  );
}
