"use client";

import Image from "next/image";
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
import { cn } from "@/lib/utils";

type GalleryItem = {
  id: string;
  category: string;
  title: string;
  caption: string;
  imageSrc: string;
  gridClass: string;
  minHClass: string;
};

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "1",
    category: "Community",
    title: "Community Iftar",
    caption: "Bringing members together for Ramadan evenings.",
    imageSrc:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1400&q=80",
    gridClass:
      "md:col-span-7 md:row-span-2 md:col-start-1 md:row-start-1",
    minHClass: "min-h-[280px]",
  },
  {
    id: "2",
    category: "Education",
    title: "Study circles",
    caption: "Weekly discussion and learning sessions.",
    imageSrc:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
    gridClass:
      "md:col-span-5 md:row-span-1 md:col-start-8 md:row-start-1",
    minHClass: "min-h-[200px]",
  },
  {
    id: "3",
    category: "Education",
    title: "Campus outreach",
    caption: "Welcoming new students at the start of term.",
    imageSrc:
      "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=900&q=80",
    gridClass:
      "md:col-span-5 md:row-span-1 md:col-start-8 md:row-start-2",
    minHClass: "min-h-[200px]",
  },
  {
    id: "4",
    category: "Service",
    title: "Charity drive",
    caption: "Collecting essentials for families in need.",
    imageSrc:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80",
    gridClass:
      "md:col-span-4 md:row-span-2 md:col-start-1 md:row-start-3",
    minHClass: "min-h-[240px]",
  },
  {
    id: "5",
    category: "Community",
    title: "Leadership workshop",
    caption: "Skills for organizing and public speaking.",
    imageSrc:
      "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=800&q=80",
    gridClass:
      "md:col-span-4 md:row-span-2 md:col-start-5 md:row-start-3",
    minHClass: "min-h-[240px]",
  },
  {
    id: "6",
    category: "Community",
    title: "Annual gathering",
    caption: "Celebrating milestones with the wider community.",
    imageSrc:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80",
    gridClass:
      "md:col-span-4 md:row-span-2 md:col-start-9 md:row-start-3",
    minHClass: "min-h-[240px]",
  },
  {
    id: "7",
    category: "Education",
    title: "Youth programme",
    caption: "Workshops and mentorship for secondary students.",
    imageSrc:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
    gridClass:
      "md:col-span-6 md:row-span-1 md:col-start-1 md:row-start-5",
    minHClass: "min-h-[200px]",
  },
  {
    id: "8",
    category: "Community",
    title: "Interfaith dialogue",
    caption: "Shared meals and conversation across communities.",
    imageSrc:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
    gridClass:
      "md:col-span-6 md:row-span-1 md:col-start-7 md:row-start-5",
    minHClass: "min-h-[200px]",
  },
  {
    id: "9",
    category: "Service",
    title: "Volunteer training",
    caption: "Safeguarding and welcome-desk refresher sessions.",
    imageSrc:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    gridClass:
      "md:col-span-4 md:row-span-1 md:col-start-1 md:row-start-6",
    minHClass: "min-h-[200px]",
  },
  {
    id: "10",
    category: "Education",
    title: "Quran competition",
    caption: "Youth and adult categories with community judges.",
    imageSrc:
      "https://images.unsplash.com/photo-1609599008333-caa8e0449921?auto=format&fit=crop&w=800&q=80",
    gridClass:
      "md:col-span-4 md:row-span-1 md:col-start-5 md:row-start-6",
    minHClass: "min-h-[200px]",
  },
  {
    id: "11",
    category: "Community",
    title: "Family day picnic",
    caption: "Games, food stalls, and prayer space on the lawn.",
    imageSrc:
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=80",
    gridClass:
      "md:col-span-4 md:row-span-1 md:col-start-9 md:row-start-6",
    minHClass: "min-h-[200px]",
  },
  {
    id: "12",
    category: "Community",
    title: "Graduation send-off",
    caption: "Celebrating students moving to the next chapter.",
    imageSrc:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    gridClass:
      "md:col-span-12 md:row-span-1 md:col-start-1 md:row-start-7",
    minHClass: "min-h-[180px]",
  },
];

function getGalleryCategories(): string[] {
  const set = new Set(GALLERY_ITEMS.map((item) => item.category));
  return [...set].sort((a, b) => a.localeCompare(b));
}

const PHOTO_PAGE_SIZE = 6;

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
        "group relative flex cursor-pointer overflow-hidden rounded-2xl border border-black/[0.06] bg-muted text-left shadow-sm ring-1 ring-black/[0.04] transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-2 dark:border-white/10 dark:ring-white/5",
        uniformLayout
          ? "min-h-[220px] w-full md:min-h-[260px]"
          : cn(item.gridClass, item.minHClass, "md:min-h-0 md:h-full"),
      )}
    >
      <span className="relative min-h-[inherit] w-full flex-1 md:min-h-0 md:h-full">
        <Image
          src={item.imageSrc}
          alt={item.title}
          fill
          className="object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <span
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10"
          aria-hidden
        />
        <span className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <span className="block text-lg font-semibold tracking-tight text-white drop-shadow-sm sm:text-xl">
            {item.title}
          </span>
          <span className="mt-1.5 block text-sm leading-relaxed text-white/85">
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
}: {
  embedded?: boolean;
  /** When set (e.g. on the home page), only the first N photos are shown. */
  maxItems?: number;
  /** Full listing page: paginate with `DataPagination` and a uniform grid. */
  paginated?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const galleryCategories = useMemo(() => getGalleryCategories(), []);

  const fullList = useMemo(() => {
    const base =
      maxItems != null ? GALLERY_ITEMS.slice(0, maxItems) : GALLERY_ITEMS;
    if (!paginated || selectedCategory == null) {
      return base;
    }
    return base.filter((item) => item.category === selectedCategory);
  }, [maxItems, paginated, selectedCategory]);

  const pagination = usePagination({
    totalItems: fullList.length,
    pageSize: PHOTO_PAGE_SIZE,
  });

  const { offset, pageSize, page, setPage, totalPages } = pagination;

  const items = useMemo(() => {
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

  const count = items.length;

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
          <ActivityCategoryFilter
            categories={galleryCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            className="mb-8 sm:mb-10"
          />
        ) : null}

        {paginated && GALLERY_ITEMS.length > 0 ? (
          <p className="mb-6 text-sm text-muted-foreground sm:mb-8">
            {fullList.length === 0 ? (
              <>
                No photos in category{" "}
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
                  {offset + 1}–{offset + items.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {fullList.length}
                </span>{" "}
                {fullList.length === 1 ? "photo" : "photos"}
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

        <div
          className={cn(
            "grid gap-3 sm:gap-4",
            paginated
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 md:grid-cols-12 md:auto-rows-[minmax(11rem,1fr)]",
          )}
        >
          {items.map((item, index) => (
            <GalleryCard
              key={item.id}
              item={item}
              uniformLayout={paginated}
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
                    {active.title}
                  </DialogTitle>
                  <DialogDescription className="mt-2 text-base leading-relaxed">
                    {active.caption}
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
