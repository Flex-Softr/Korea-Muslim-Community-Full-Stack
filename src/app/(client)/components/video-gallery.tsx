"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
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
import { VIDEO_GALLERY_ITEMS, type VideoGalleryItem } from "@/data/gallery-media";
import { useLanguage } from "@/components/providers/language-provider";
import { pickLocalizedFields } from "@/lib/i18n/content-locale";
import { cn } from "@/lib/utils";

type VideoEntry = VideoGalleryItem;

const VIDEO_PAGE_SIZE = 12;

function getYoutubeThumbnailUrl(videoUrl: string): string | null {
  const videoId = resolveYoutubeVideoId(videoUrl);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function resolveYoutubeVideoId(videoUrl: string): string | null {
  if (!videoUrl) return null;

  const normalizedUrl = videoUrl.trim();
  if (!normalizedUrl) return null;

  const resolveFromUrl = (urlValue: URL): string | null => {
    const host = urlValue.hostname.replace(/^www\./, "").toLowerCase();
    const path = urlValue.pathname;
    const segments = path.split("/").filter(Boolean);

    if (host === "youtu.be") {
      return segments[0] ?? null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (path === "/watch") {
        return urlValue.searchParams.get("v");
      }
      if (segments[0] === "embed" || segments[0] === "shorts") {
        return segments[1] ?? null;
      }
    }

    return null;
  };

  try {
    return resolveFromUrl(new URL(normalizedUrl));
  } catch {
    try {
      return resolveFromUrl(new URL(`https://${normalizedUrl}`));
    } catch {
      return null;
    }
  }
}

function getVideoEmbedUrl(videoUrl: string): string {
  const youtubeId = resolveYoutubeVideoId(videoUrl);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}?rel=0`;
  }

  if (videoUrl.includes("?")) {
    return `${videoUrl}&rel=0`;
  }
  return `${videoUrl}?rel=0`;
}

function VideoCard({
  title,
  thumbClass,
  thumbnailUrl,
  onOpen,
}: {
  title: string;
  thumbClass: string;
  thumbnailUrl: string | null;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full cursor-pointer flex-col overflow-hidden rounded-lg border border-black/[0.06] bg-white text-left shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-2 dark:border-white/10 dark:bg-card"
    >
      <span className={cn("relative aspect-video overflow-hidden bg-muted", !thumbnailUrl && "bg-gradient-to-br", !thumbnailUrl && thumbClass)}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="absolute inset-0 size-full object-cover"
            loading="lazy"
            aria-hidden
          />
        ) : null}
        <span className="absolute inset-0 bg-black/20" aria-hidden />
        <span className="absolute inset-0 flex items-center justify-center">
          <span
            className="flex size-14 items-center justify-center rounded-full bg-white/85 text-[#2c7bb6] shadow-md transition-opacity duration-200 group-hover:bg-white dark:bg-white/90"
            aria-hidden
          >
            <Play className="ms-0.5 size-7 fill-[#2c7bb6] stroke-[#2c7bb6]" />
          </span>
        </span>
      </span>
      <span className="px-3 py-3 sm:px-4 sm:py-3.5">
        <span className="block text-sm font-medium leading-snug text-foreground sm:text-[0.9375rem]">
          {title}
        </span>
      </span>
    </button>
  );
}

export function VideoGallery({
  embedded = false,
  maxItems,
  paginated = false,
  sourceItems,
}: {
  embedded?: boolean;
  /** When set (e.g. on the home page), only the first N videos are shown. */
  maxItems?: number;
  /** Full listing page: paginate with `DataPagination`. */
  paginated?: boolean;
  sourceItems?: VideoEntry[];
}) {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [localCategory, setLocalCategory] = useState<string | null>(null);
  const [localYear, setLocalYear] = useState<number | null>(null);
  const baseItems = useMemo(() => {
    const items = sourceItems ?? VIDEO_GALLERY_ITEMS;
    return items.map((item) => {
      if (!item.localeContent) return item;
      const localized = pickLocalizedFields(item.localeContent, lang);
      return {
        ...item,
        title: localized.title?.trim() || item.title,
        category: localized.category?.trim() || item.category,
        caption: localized.description?.trim() || item.caption,
      };
    });
  }, [lang, sourceItems]);

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

  const videoCategories = useMemo(
    () =>
      [...new Set(baseItems.map((v) => v.category))].sort((a, b) =>
        a.localeCompare(b),
      ),
    [baseItems],
  );
  const videoYears = useMemo(
    () =>
      [...new Set(baseItems.map((v) => Number.parseInt(v.dateIso.slice(0, 4), 10)))]
        .filter(Number.isFinite)
        .sort((a, b) => b - a),
    [baseItems],
  );

  const fullList = useMemo(() => {
    const base =
      maxItems != null ? baseItems.slice(0, maxItems) : baseItems;
    if (!paginated) return base;
    return base.filter((v) => {
      if (selectedCategory != null && v.category !== selectedCategory) {
        return false;
      }
      if (selectedYear != null) {
        const year = Number.parseInt(v.dateIso.slice(0, 4), 10);
        return year === selectedYear;
      }
      return true;
    });
  }, [baseItems, maxItems, paginated, selectedCategory, selectedYear]);

  const pagination = usePagination({
    totalItems: fullList.length,
    pageSize: VIDEO_PAGE_SIZE,
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

  const videos = useMemo(() => {
    if (!paginated) {
      return fullList;
    }
    return fullList.slice(offset, offset + pageSize);
  }, [fullList, paginated, offset, pageSize]);

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

  const count = videos.length;

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

  const active = openIndex !== null ? videos[openIndex] : null;

  return (
    <section
      className={cn(
        "w-full bg-muted/40 py-12 sm:py-14 dark:bg-muted/20",
        embedded
          ? "pb-12 pt-6 sm:pb-16 sm:pt-8"
          : "border-t border-border/40",
      )}
      aria-label={embedded ? t("videoGallery.embeddedAria") : undefined}
      aria-labelledby={embedded ? undefined : "video-gallery-heading"}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {!embedded ? (
          <>
            <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
              <h2
                id="video-gallery-heading"
                className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                {t("common.videoGallery")}
              </h2>
              <Link
                href="/video-gallery"
                className="inline-flex w-fit items-center gap-2 rounded-md bg-[#2c7bb6] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#256fa3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-2"
              >
                {t("videoGallery.seeMore")}
                <ArrowUpRight className="size-4 shrink-0" aria-hidden />
              </Link>
            </div>

            <p className="mb-6 text-sm text-muted-foreground">
              {t("pages.videos.subtitle")}
            </p>
          </>
        ) : null}

        {paginated ? (
          <>
            <ActivityCategoryFilter
              categories={videoCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              title={t("photoGallery.filterByCategory")}
              allLabel={t("photoGallery.allCategories")}
              clearLabel={t("photoGallery.clearCategory")}
              ariaLabel={t("videoGallery.categoriesAria")}
              className="mb-4"
            />
            <ActivityCategoryFilter
              categories={videoYears.map(String)}
              selectedCategory={
                selectedYear != null ? String(selectedYear) : null
              }
              onSelectCategory={handleSelectYear}
              title={t("blog.filterByYear")}
              allLabel={t("blog.allYears")}
              clearLabel={t("blog.clearYear")}
              ariaLabel={t("videoGallery.yearsAria")}
              className="mb-8 sm:mb-10"
            />
          </>
        ) : null}

        {paginated && baseItems.length > 0 ? (
          <p className="mb-6 text-sm text-muted-foreground sm:mb-8">
            {fullList.length === 0 ? (
              <>
                {t("videoGallery.noMatchPrefix")}{" "}
                <button
                  type="button"
                  onClick={() => {
                    handleSelectCategory(null);
                    handleSelectYear(null);
                  }}
                  className="font-medium text-[#2c7bb6] underline-offset-4 hover:underline dark:text-sky-400"
                >
                  {t("blog.showAll")}
                </button>
                .
              </>
            ) : (
              <>
                {t(
                  fullList.length === 1
                    ? "videoGallery.summaryVideo"
                    : "videoGallery.summaryVideos",
                  {
                    start: offset + 1,
                    end: offset + videos.length,
                    total: fullList.length,
                  },
                )}
                {selectedCategory != null || selectedYear != null
                  ? ` ${t("videoGallery.withFilters")}`
                  : null}
              </>
            )}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {videos.map((v, index) => (
            <VideoCard
              key={v.id}
              title={v.title}
              thumbClass={v.thumbClass}
              thumbnailUrl={getYoutubeThumbnailUrl(v.embedUrl)}
              onOpen={() => setOpenIndex(index)}
            />
          ))}
        </div>

        {paginated && fullList.length > 0 && totalPages > 1 ? (
          <DataPagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mt-10"
            ariaLabel={t("videoGallery.paginationAria")}
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
            className="max-w-4xl gap-0 overflow-hidden p-0"
          >
            <div className="relative aspect-video w-full bg-black">
              <iframe
                key={active.id}
                src={getVideoEmbedUrl(active.embedUrl)}
                title={active.title}
                className="absolute inset-0 size-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <div className="border-t border-border bg-background p-4 sm:p-5">
              <DialogTitle className="pe-8 text-base sm:text-lg">
                {active.title}
              </DialogTitle>
              {active.caption ? (
                <DialogDescription className="mt-2 text-sm leading-relaxed sm:text-base">
                  {active.caption}
                </DialogDescription>
              ) : (
                <DialogDescription className="sr-only">
                  {t("videoGallery.playerSrOnly")}
                </DialogDescription>
              )}
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
                <LightboxArrowButton
                  direction="prev"
                  label="Previous video"
                  onClick={goPrev}
                />
                <span className="text-xs text-muted-foreground tabular-nums">
                  {openIndex + 1} / {count}
                </span>
                <LightboxArrowButton
                  direction="next"
                  label={t("videoGallery.nextVideo")}
                  onClick={goNext}
                />
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </section>
  );
}
