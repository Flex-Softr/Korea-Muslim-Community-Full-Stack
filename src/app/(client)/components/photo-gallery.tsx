"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityCategoryFilter } from "@/components/activity/activity-category-filter";
import { LightboxArrowButton } from "@/components/media/lightbox-arrows";
import { DataPagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { PHOTO_GALLERY_ITEMS, type PhotoGalleryItem } from "@/data/gallery-media";
import { cn } from "@/lib/utils";

type GalleryItem = PhotoGalleryItem;

const PHOTO_PAGE_SIZE = 6;
const EMBEDDED_LAYOUT_FOR_SIX = [
  "md:col-span-6 md:row-span-2 min-h-[320px] md:min-h-0",
  "md:col-span-3 md:row-span-1 min-h-[220px] md:min-h-0",
  "md:col-span-3 md:row-span-1 min-h-[220px] md:min-h-0",
  "md:col-span-6 md:row-span-2 min-h-[320px] md:min-h-0",
  "md:col-span-3 md:row-span-1 min-h-[220px] md:min-h-0",
  "md:col-span-3 md:row-span-1 min-h-[220px] md:min-h-0",
] as const;

function GalleryCard({
  item,
  onOpen,
  uniformLayout,
}: {
  item: GalleryItem;
  onOpen: () => void;
  /** Simple grid cells for paginated full-page gallery (no masonry spans). */
  uniformLayout?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative flex cursor-pointer overflow-hidden rounded-2xl border border-black/[0.08] bg-muted text-left shadow-sm ring-1 ring-black/[0.04] transition-all duration-300 outline-none hover:-translate-y-1 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-2 dark:border-white/15 dark:ring-white/5",
        uniformLayout
          ? "min-h-[220px] w-full md:min-h-[260px]"
          : "h-full w-full",
      )}
    >
      <span className="relative min-h-[inherit] w-full flex-1 md:min-h-0 md:h-full">
        <Image
          src={item.imageSrc}
          alt={item.caption}
          fill
          className="object-cover transition duration-500 ease-out group-hover:scale-[1.08] group-hover:brightness-[0.85]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-4 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:p-5">
          <span className="line-clamp-2 block text-sm font-semibold tracking-tight text-white drop-shadow-sm sm:text-base">
            {item.caption}
          </span>
        </span>
      </span>
    </button>
  );
}

export function PhotoGallery({
  embedded = false,
  maxItems,
  paginated = false,
  sourceItems,
}: {
  embedded?: boolean;
  /** When set (e.g. on the home page), only the first N photos are shown. */
  maxItems?: number;
  /** Full listing page: paginate with `DataPagination` and a uniform grid. */
  paginated?: boolean;
  sourceItems?: GalleryItem[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [localCategory, setLocalCategory] = useState<string | null>(null);
  const [localYear, setLocalYear] = useState<number | null>(null);
  const baseItems = useMemo(
    () => sourceItems ?? PHOTO_GALLERY_ITEMS,
    [sourceItems],
  );
  const parsedCategory = useMemo(() => {
    const category = searchParams.get("category");
    return category?.trim() ? category : null;
  }, [searchParams]);
  const parsedYear = useMemo(() => {
    const raw = searchParams.get("year");
    const year = raw ? Number.parseInt(raw, 10) : null;
    return year != null && Number.isFinite(year) ? year : null;
  }, [searchParams]);
  const selectedCategory = paginated ? parsedCategory : localCategory;
  const selectedYear = paginated ? parsedYear : localYear;

  const galleryCategories = useMemo(
    () =>
      [...new Set(baseItems.map((item) => item.category))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [baseItems],
  );
  const galleryYears = useMemo(
    () =>
      [...new Set(baseItems.map((item) => Number.parseInt(item.dateIso.slice(0, 4), 10)))]
        .filter(Number.isFinite)
        .sort((a, b) => b - a),
    [baseItems],
  );

  const fullList = useMemo(() => {
    const base =
      maxItems != null ? baseItems.slice(0, maxItems) : baseItems;
    if (!paginated) return base;
    return base.filter((item) => {
      if (selectedCategory != null && item.category !== selectedCategory) {
        return false;
      }
      if (selectedYear != null) {
        const year = Number.parseInt(item.dateIso.slice(0, 4), 10);
        return year === selectedYear;
      }
      return true;
    });
  }, [baseItems, maxItems, paginated, selectedCategory, selectedYear]);

  const pagination = usePagination({
    totalItems: fullList.length,
    pageSize: PHOTO_PAGE_SIZE,
  });

  const { offset, pageSize, page, setPage, totalPages } = pagination;

  useEffect(() => {
    if (!paginated) return;
    const params = new URLSearchParams(searchParamsString);
    const pageRaw = params.get("page");
    const nextPage = pageRaw ? Number.parseInt(pageRaw, 10) : 1;
    if (Number.isFinite(nextPage)) {
      setPage(nextPage);
    }
  }, [paginated, searchParamsString, setPage]);

  const items = useMemo(() => {
    if (!paginated) {
      return fullList;
    }
    return fullList.slice(offset, offset + pageSize);
  }, [fullList, paginated, offset, pageSize]);

  const getSixTileLayoutClass = useCallback(
    (index: number) => EMBEDDED_LAYOUT_FOR_SIX[index] ?? "md:col-span-4 md:row-span-1 min-h-[170px] md:min-h-0",
    [],
  );

  const handleSelectCategory = useCallback(
    (category: string | null) => {
      if (!paginated) {
        setLocalCategory(category);
        return;
      }
      const params = new URLSearchParams(searchParamsString);
      if (category) params.set("category", category);
      else params.delete("category");
      params.delete("page");
      router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname, {
        scroll: false,
      });
      setOpenIndex(null);
    },
    [paginated, pathname, router, searchParamsString],
  );

  const handleSelectYear = useCallback(
    (year: string | null) => {
      const parsed = year != null ? Number.parseInt(year, 10) : null;
      if (!paginated) {
        setLocalYear(parsed);
        return;
      }
      const params = new URLSearchParams(searchParamsString);
      if (parsed != null) params.set("year", String(parsed));
      else params.delete("year");
      params.delete("page");
      router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname, {
        scroll: false,
      });
      setOpenIndex(null);
    },
    [paginated, pathname, router, searchParamsString],
  );

  const handlePageChange = useCallback(
    (next: number) => {
      setPage(next);
      setOpenIndex(null);
    },
    [setPage],
  );

  const count = items.length;

  useEffect(() => {
    if (!paginated) return;
    const params = new URLSearchParams(searchParamsString);
    if (selectedCategory) params.set("category", selectedCategory);
    else params.delete("category");
    if (selectedYear != null) params.set("year", String(selectedYear));
    else params.delete("year");
    params.set("page", String(page));
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [
    page,
    paginated,
    pathname,
    router,
    searchParamsString,
    selectedCategory,
    selectedYear,
  ]);

  const goPrev = useCallback(() => {
    setOpenIndex((i) =>
      i === null ? i : (i - 1 + count) % count,
    );
  }, [count]);

  const goNext = useCallback(() => {
    setOpenIndex((i) =>
      i === null ? i : (i + 1) % count,
    );
  }, [count]);

  useEffect(() => {
    if (openIndex === null) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, goPrev, goNext]);

  const active = openIndex !== null ? items[openIndex] : null;

  return (
    <section
      className={cn(
        "w-full bg-background",
        embedded
          ? "pb-12 pt-6 sm:pb-16 sm:pt-8"
          : "border-t border-border/40 py-12 sm:py-14",
      )}
      aria-label={embedded ? "Photo gallery" : undefined}
      aria-labelledby={embedded ? undefined : "gallery-section-heading"}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {!embedded ? (
          <div className="mb-8 max-w-2xl sm:mb-10">
            <h2
              id="gallery-section-heading"
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Gallery
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Photo highlights from programmes, service, and community life.
              Select an image to view it larger with caption.
            </p>
          </div>
        ) : null}

        {paginated ? (
          <>
            <ActivityCategoryFilter
              categories={galleryCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              className="mb-4"
            />
            <ActivityCategoryFilter
              categories={galleryYears.map(String)}
              selectedCategory={
                selectedYear != null ? String(selectedYear) : null
              }
              onSelectCategory={handleSelectYear}
              title="Filter by year"
              allLabel="All years"
              clearLabel="Clear year"
              ariaLabel="Photo years"
              className="mb-8 sm:mb-10"
            />
          </>
        ) : null}

        {paginated && baseItems.length > 0 ? (
          <p className="mb-6 text-sm text-muted-foreground sm:mb-8">
            {fullList.length === 0 ? (
              <>
                No photos match your filters. Try another filter or{" "}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectCategory(null);
                    handleSelectYear(null);
                  }}
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
                  {offset + 1}–{offset + items.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {fullList.length}
                </span>{" "}
                {fullList.length === 1 ? "photo" : "photos"}
                {selectedCategory != null || selectedYear != null ? (
                  <>
                    {" "}
                    with filters
                  </>
                ) : null}
              </>
            )}
          </p>
        ) : null}

        <div
          className={cn(
            "gap-3 sm:gap-4",
            paginated
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : items.length === 6
                ? "grid grid-cols-1 md:grid-cols-12 md:auto-rows-[140px] lg:auto-rows-[170px]"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {items.map((item, index) =>
            paginated ? (
              <GalleryCard
                key={item.id}
                item={item}
                uniformLayout
                onOpen={() => setOpenIndex(index)}
              />
            ) : (
              <div
                key={item.id}
                className={cn(
                  items.length === 6
                    ? getSixTileLayoutClass(index)
                    : "min-h-[220px] md:min-h-[260px]",
                )}
              >
                <GalleryCard
                  item={item}
                  onOpen={() => setOpenIndex(index)}
                />
              </div>
            ),
          )}
        </div>

        {paginated && fullList.length > 0 && totalPages > 1 ? (
          <DataPagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mt-10"
            ariaLabel="Photo gallery pagination"
            showSummary
            align="center"
          />
        ) : null}
      </div>

      <Dialog
        open={openIndex !== null}
        onOpenChange={(next) => {
          if (!next) {
            setOpenIndex(null);
          }
        }}
      >
        {active && openIndex !== null ? (
          <DialogContent
            key={active.id}
            className="max-w-5xl gap-0 p-0 sm:max-h-[90dvh]"
          >
            <div className="flex max-h-[min(90dvh,920px)] flex-col md:max-h-[85dvh] md:flex-row">
              <div className="relative aspect-[4/3] w-full shrink-0 bg-black md:aspect-auto md:min-h-0 md:flex-1 md:min-h-[320px]">
                <Image
                  src={active.imageSrc}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 80vw"
                  priority
                />
              </div>
              <div className="flex w-full shrink-0 flex-col justify-between gap-4 border-t border-border bg-background p-4 sm:p-5 md:w-[min(100%,20rem)] md:border-t-0 md:border-s">
                <div className="pe-8">
                  <DialogTitle className="text-base sm:text-lg">
                    {active.caption}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Photo caption
                  </DialogDescription>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
                  <LightboxArrowButton
                    direction="prev"
                    label="Previous image"
                    onClick={goPrev}
                  />
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {openIndex + 1} / {count}
                  </span>
                  <LightboxArrowButton
                    direction="next"
                    label="Next image"
                    onClick={goNext}
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </section>
  );
}
