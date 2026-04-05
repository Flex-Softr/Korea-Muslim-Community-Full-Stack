"use client";

import Link from "next/link";
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
import { cn } from "@/lib/utils";

type VideoEntry = {
  id: string;
  category: string;
  title: string;
  thumbClass: string;
  /** YouTube / Vimeo embed URL (replace with your real video IDs). */
  embedUrl: string;
  caption?: string;
};

const VIDEOS: VideoEntry[] = [
  {
    id: "1",
    category: "Community",
    title: "Barakah Iftar Gift Program",
    thumbClass: "from-slate-600 via-slate-700 to-slate-900",
    embedUrl: "https://www.youtube-nocookie.com/embed/jNQXAC9IVRw",
    caption: "Replace embed URLs in the video list with your own uploads.",
  },
  {
    id: "2",
    category: "Education",
    title: "Discussion on Historic Badr Day",
    thumbClass: "from-indigo-600 via-blue-800 to-slate-900",
    embedUrl: "https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ",
  },
  {
    id: "3",
    category: "Education",
    title: "Face to Face with Talented Students — 03",
    thumbClass: "from-emerald-700 via-teal-800 to-slate-900",
    embedUrl: "https://www.youtube-nocookie.com/embed/ysz5S6PUM-U",
  },
  {
    id: "4",
    category: "Education",
    title: "Face to Face with Talented Students — Part 02",
    thumbClass: "from-amber-700 via-orange-800 to-stone-900",
    embedUrl: "https://www.youtube-nocookie.com/embed/L_jWHffIx5E",
  },
  {
    id: "5",
    category: "Education",
    title: "Face to Face with Talented Students — Part 01",
    thumbClass: "from-violet-600 via-purple-800 to-slate-900",
    embedUrl: "https://www.youtube-nocookie.com/embed/9bZkp7q19f0",
  },
  {
    id: "6",
    category: "Culture",
    title: "Photo Exhibition: community highlights",
    thumbClass: "from-rose-700 via-red-900 to-stone-950",
    embedUrl: "https://www.youtube-nocookie.com/embed/kJQP7kiw5Fk",
  },
  {
    id: "7",
    category: "Education",
    title: "Face to Face with Students: leadership talk",
    thumbClass: "from-cyan-700 via-sky-900 to-slate-900",
    embedUrl: "https://www.youtube-nocookie.com/embed/OPf0YbXqDm0",
  },
  {
    id: "8",
    category: "Community",
    title: "Community forum recording",
    thumbClass: "from-neutral-600 via-neutral-800 to-zinc-950",
    embedUrl: "https://www.youtube-nocookie.com/embed/ScMzIvxBSi4",
  },
];

function getVideoGalleryCategories(): string[] {
  const set = new Set(VIDEOS.map((v) => v.category));
  return [...set].sort((a, b) => a.localeCompare(b));
}

const VIDEO_PAGE_SIZE = 4;

function VideoCard({
  title,
  thumbClass,
  onOpen,
}: {
  title: string;
  thumbClass: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full cursor-pointer flex-col overflow-hidden rounded-lg border border-black/[0.06] bg-white text-left shadow-sm outline-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-2 dark:border-white/10 dark:bg-card"
    >
      <span
        className={cn(
          "relative aspect-video overflow-hidden bg-muted bg-gradient-to-br",
          thumbClass,
        )}
      >
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
}: {
  embedded?: boolean;
  /** When set (e.g. on the home page), only the first N videos are shown. */
  maxItems?: number;
  /** Full listing page: paginate with `DataPagination`. */
  paginated?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const videoCategories = useMemo(() => getVideoGalleryCategories(), []);

  const fullList = useMemo(() => {
    const base = maxItems != null ? VIDEOS.slice(0, maxItems) : VIDEOS;
    if (!paginated || selectedCategory == null) {
      return base;
    }
    return base.filter((v) => v.category === selectedCategory);
  }, [maxItems, paginated, selectedCategory]);

  const pagination = usePagination({
    totalItems: fullList.length,
    pageSize: VIDEO_PAGE_SIZE,
  });

  const { offset, pageSize, page, setPage, totalPages } = pagination;

  const videos = useMemo(() => {
    if (!paginated) {
      return fullList;
    }
    return fullList.slice(offset, offset + pageSize);
  }, [fullList, paginated, offset, pageSize]);

  const handleSelectCategory = useCallback(
    (category: string | null) => {
      setSelectedCategory(category);
      if (paginated) {
        setPage(1);
        setOpenIndex(null);
      }
    },
    [paginated, setPage],
  );

  const handlePageChange = useCallback(
    (next: number) => {
      setPage(next);
      setOpenIndex(null);
    },
    [setPage],
  );

  const count = videos.length;

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
      aria-label={embedded ? "Video gallery" : undefined}
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
                Video Gallery
              </h2>
              <Link
                href="/video-gallery"
                className="inline-flex w-fit items-center gap-2 rounded-md bg-[#2c7bb6] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#256fa3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-2"
              >
                See more
                <ArrowUpRight className="size-4 shrink-0" aria-hidden />
              </Link>
            </div>

            <p className="mb-6 text-sm text-muted-foreground">
              Tap a thumbnail to play in a modal. Use on-screen arrows or
              keyboard left/right to move between videos.
            </p>
          </>
        ) : null}

        {paginated ? (
          <ActivityCategoryFilter
            categories={videoCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            className="mb-8 sm:mb-10"
          />
        ) : null}

        {paginated && VIDEOS.length > 0 ? (
          <p className="mb-6 text-sm text-muted-foreground sm:mb-8">
            {fullList.length === 0 ? (
              <>
                No videos in category{" "}
                <span className="font-medium text-foreground">
                  {selectedCategory}
                </span>
                . Try another category or{" "}
                <button
                  type="button"
                  onClick={() => handleSelectCategory(null)}
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
                  {offset + 1}–{offset + videos.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {fullList.length}
                </span>{" "}
                {fullList.length === 1 ? "video" : "videos"}
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
        ) : null}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {videos.map((v, index) => (
            <VideoCard
              key={v.id}
              title={v.title}
              thumbClass={v.thumbClass}
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
            ariaLabel="Video gallery pagination"
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
                src={
                  active.embedUrl.includes("?")
                    ? `${active.embedUrl}&rel=0`
                    : `${active.embedUrl}?rel=0`
                }
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
                  Video player
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
                  label="Next video"
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
