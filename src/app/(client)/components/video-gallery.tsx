// "use client";

// import Link from "next/link";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import { ArrowUpRight, Play } from "lucide-react";
// import { ActivityCategoryFilter } from "@/components/activity/activity-category-filter";
// import { LightboxArrowButton } from "@/components/media/lightbox-arrows";
// import { DataPagination } from "@/components/ui/pagination";
// import { usePagination } from "@/hooks/use-pagination";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   VIDEO_GALLERY_ITEMS,
//   type VideoGalleryItem,
// } from "@/data/gallery-media";
// import { useLanguage } from "@/components/providers/language-provider";
// import { pickLocalizedFields } from "@/lib/i18n/content-locale";
// import { cn } from "@/lib/utils";

// type VideoEntry = VideoGalleryItem;

// const VIDEO_PAGE_SIZE = 12;

// /* ---------------- helpers ---------------- */

// function resolveYoutubeVideoId(videoUrl: string): string | null {
//   if (!videoUrl) return null;

//   const normalizedUrl = videoUrl.trim();
//   if (!normalizedUrl) return null;

//   const parse = (urlValue: URL): string | null => {
//     const host = urlValue.hostname.replace(/^www\./, "").toLowerCase();
//     const path = urlValue.pathname;
//     const segments = path.split("/").filter(Boolean);

//     if (host === "youtu.be") return segments[0] ?? null;

//     if (host === "youtube.com" || host === "m.youtube.com") {
//       if (path === "/watch") return urlValue.searchParams.get("v");
//       if (segments[0] === "embed" || segments[0] === "shorts") {
//         return segments[1] ?? null;
//       }
//     }

//     return null;
//   };

//   try {
//     return parse(new URL(normalizedUrl));
//   } catch {
//     try {
//       return parse(new URL(`https://${normalizedUrl}`));
//     } catch {
//       return null;
//     }
//   }
// }

// function getYoutubeThumbnailUrl(videoUrl: string): string | null {
//   const videoId = resolveYoutubeVideoId(videoUrl);
//   if (!videoId) return null;
//   return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
// }

// function getVideoEmbedUrl(videoUrl: string): string {
//   const youtubeId = resolveYoutubeVideoId(videoUrl);
//   if (youtubeId) {
//     return `https://www.youtube.com/embed/${youtubeId}?rel=0`;
//   }

//   if (videoUrl.includes("?")) return `${videoUrl}&rel=0`;
//   return `${videoUrl}?rel=0`;
// }

// /* ---------------- card ---------------- */

// function VideoCard({
//   title,
//   thumbClass,
//   thumbnailUrl,
//   onOpen,
// }: {
//   title: string;
//   thumbClass: string;
//   thumbnailUrl: string | null;
//   onOpen: () => void;
// }) {
//   return (
//     <button
//       type="button"
//       onClick={onOpen}
//       className="group flex w-full flex-col overflow-hidden rounded-lg border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
//     >
//       <span
//         className={cn(
//           "relative aspect-video overflow-hidden bg-muted",
//           !thumbnailUrl && thumbClass,
//         )}
//       >
//         {thumbnailUrl ? (
//           <img
//             src={thumbnailUrl}
//             alt=""
//             className="absolute inset-0 size-full object-cover"
//             loading="lazy"
//           />
//         ) : null}

//         <span className="absolute inset-0 flex items-center justify-center">
//           <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-[#2c7bb6]">
//             <Play className="size-6 fill-[#2c7bb6]" />
//           </span>
//         </span>
//       </span>

//       <span className="px-3 py-3 text-sm font-medium">{title}</span>
//     </button>
//   );
// }

// /* ---------------- main ---------------- */

// export function VideoGallery({
//   embedded = false,
//   maxItems,
//   paginated = false,
//   sourceItems,
// }: {
//   embedded?: boolean;
//   maxItems?: number;
//   paginated?: boolean;
//   sourceItems?: VideoEntry[];
// }) {
//   const { t, lang } = useLanguage();
//   const router = useRouter();
//   const pathname = usePathname();

//   /* ✅ FIX: safe searchParams */
//   const searchParamsRaw = useSearchParams();
//   const searchParams = searchParamsRaw ?? new URLSearchParams();
//   const searchParamsString = searchParams.toString();

//   const [openIndex, setOpenIndex] = useState<number | null>(null);
//   const [localCategory, setLocalCategory] = useState<string | null>(null);
//   const [localYear, setLocalYear] = useState<number | null>(null);

//   const baseItems = useMemo(() => {
//     const items = sourceItems ?? VIDEO_GALLERY_ITEMS;

//     return items.map((item) => {
//       if (!item.localeContent) return item;

//       const localized = pickLocalizedFields(item.localeContent, lang);

//       return {
//         ...item,
//         title: localized.title?.trim() || item.title,
//         category: localized.category?.trim() || item.category,
//         caption: localized.description?.trim() || item.caption,
//       };
//     });
//   }, [lang, sourceItems]);

//   const parsedCategory = useMemo(() => {
//     const category = searchParams.get("category");
//     return category?.trim() ? category : null;
//   }, [searchParams]);

//   const parsedYear = useMemo(() => {
//     const raw = searchParams.get("year");
//     const year = raw ? Number.parseInt(raw, 10) : null;
//     return year != null && Number.isFinite(year) ? year : null;
//   }, [searchParams]);

//   const selectedCategory = paginated ? parsedCategory : localCategory;
//   const selectedYear = paginated ? parsedYear : localYear;

//   const videoCategories = useMemo(
//     () =>
//       [...new Set(baseItems.map((v) => v.category))].sort((a, b) =>
//         a.localeCompare(b),
//       ),
//     [baseItems],
//   );

//   const videoYears = useMemo(
//     () =>
//       [...new Set(baseItems.map((v) => Number.parseInt(v.dateIso.slice(0, 4), 10)))]
//         .filter(Number.isFinite)
//         .sort((a, b) => b - a),
//     [baseItems],
//   );

//   const fullList = useMemo(() => {
//     const base = maxItems != null ? baseItems.slice(0, maxItems) : baseItems;

//     if (!paginated) return base;

//     return base.filter((v) => {
//       if (selectedCategory && v.category !== selectedCategory) return false;

//       if (selectedYear != null) {
//         const year = Number.parseInt(v.dateIso.slice(0, 4), 10);
//         return year === selectedYear;
//       }

//       return true;
//     });
//   }, [baseItems, maxItems, paginated, selectedCategory, selectedYear]);

//   const pagination = usePagination({
//     totalItems: fullList.length,
//     pageSize: VIDEO_PAGE_SIZE,
//   });

//   const { offset, pageSize, page, setPage, totalPages } = pagination;

//   useEffect(() => {
//     if (!paginated) return;

//     const params = new URLSearchParams(searchParamsString);
//     const pageRaw = params.get("page");
//     const nextPage = pageRaw ? Number.parseInt(pageRaw, 10) : 1;

//     if (Number.isFinite(nextPage)) setPage(nextPage);
//   }, [paginated, searchParamsString, setPage]);

//   const videos = useMemo(() => {
//     if (!paginated) return fullList;
//     return fullList.slice(offset, offset + pageSize);
//   }, [fullList, paginated, offset, pageSize]);

//   return (
//     <section className="w-full bg-muted/40 py-12">
//       <div className="mx-auto max-w-7xl px-4 sm:px-6">
//         <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
//           {videos.map((v, index) => (
//             <VideoCard
//               key={v.id}
//               title={v.title}
//               thumbClass={v.thumbClass}
//               thumbnailUrl={getYoutubeThumbnailUrl(v.embedUrl)}
//               onOpen={() => setOpenIndex(index)}
//             />
//           ))}
//         </div>
//       </div>

//       <Dialog
//         open={openIndex !== null}
//         onOpenChange={(v) => !v && setOpenIndex(null)}
//       >
//         {openIndex !== null && videos[openIndex] ? (
//           <DialogContent className="max-w-4xl p-0">
//             <iframe
//               src={getVideoEmbedUrl(videos[openIndex].embedUrl)}
//               className="aspect-video w-full"
//               allowFullScreen
//             />
//           </DialogContent>
//         ) : null}
//       </Dialog>
//     </section>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ExternalLink, Play } from "lucide-react";
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
import {
  VIDEO_GALLERY_ITEMS,
  type VideoGalleryItem,
} from "@/data/gallery-media";
import { useLanguage } from "@/components/providers/language-provider";
import { pickLocalizedFields } from "@/lib/i18n/content-locale";
import { cn } from "@/lib/utils";

type VideoEntry = VideoGalleryItem;

const VIDEO_PAGE_SIZE = 12;

/* ─── Video provider detection ─────────────────────────────────────────── */

type VideoProvider = "youtube" | "facebook" | "unknown";

function detectVideoProvider(videoUrl: string): VideoProvider {
  if (!videoUrl) return "unknown";
  try {
    const url = new URL(videoUrl.trim().startsWith("http") ? videoUrl.trim() : `https://${videoUrl.trim()}`);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtube.com" || host === "youtu.be" || host === "m.youtube.com") {
      return "youtube";
    }
    if (host === "facebook.com" || host === "fb.watch" || host === "m.facebook.com") {
      return "facebook";
    }
  } catch {
    // fall through
  }
  return "unknown";
}

/* ─── YouTube ───────────────────────────────────────────────────────────── */

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

function getYoutubeThumbnailUrl(videoUrl: string): string | null {
  const videoId = resolveYoutubeVideoId(videoUrl);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function getYoutubeEmbedUrl(videoUrl: string): string | null {
  const youtubeId = resolveYoutubeVideoId(videoUrl);
  if (!youtubeId) return null;
  return `https://www.youtube.com/embed/${youtubeId}?rel=0&autoplay=1`;
}

/* ─── Facebook ──────────────────────────────────────────────────────────── */

function resolveFacebookVideoId(videoUrl: string): string | null {
  if (!videoUrl) return null;
  const normalizedUrl = videoUrl.trim();
  if (!normalizedUrl) return null;

  const resolveFromUrl = (urlValue: URL): string | null => {
    const host = urlValue.hostname.replace(/^www\./, "").toLowerCase();
    const path = urlValue.pathname;
    const segments = path.split("/").filter(Boolean);

    if (host !== "facebook.com" && host !== "m.facebook.com") return null;

    // https://www.facebook.com/video/embed?video_id=XXXXXX
    const embedId = urlValue.searchParams.get("video_id");
    if (embedId) return embedId;

    // https://www.facebook.com/watch/?v=XXXXXX
    const watchV = urlValue.searchParams.get("v");
    if (watchV) return watchV;

    // https://www.facebook.com/PAGE/videos/XXXXXX  or  /VIDEO_ID
    const videosIdx = segments.indexOf("videos");
    if (videosIdx !== -1 && segments[videosIdx + 1]) {
      return segments[videosIdx + 1];
    }

    // https://www.facebook.com/reel/XXXXXX
    const reelIdx = segments.indexOf("reel");
    if (reelIdx !== -1 && segments[reelIdx + 1]) {
      return segments[reelIdx + 1];
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

/**
 * Facebook's public Graph API returns a thumbnail image for public videos
 * without requiring an access token.
 */
function getFacebookThumbnailUrl(videoUrl: string): string | null {
  const videoId = resolveFacebookVideoId(videoUrl);
  if (!videoId) return null;
  return `https://graph.facebook.com/${videoId}/picture`;
}

/**
 * Builds a Facebook plugin embed URL.
 * Uses the `plugins/video.php` endpoint which renders the native Facebook
 * player inside an <iframe> without requiring login for public videos.
 */
function getFacebookEmbedUrl(videoUrl: string): string | null {
  if (!videoUrl) return null;
  const normalized = videoUrl.trim().startsWith("http")
    ? videoUrl.trim()
    : `https://${videoUrl.trim()}`;
  const encoded = encodeURIComponent(normalized);
  return `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&autoplay=true&mute=false`;
}

/* ─── Unified helpers ───────────────────────────────────────────────────── */

/** Returns the best available thumbnail URL for any supported video provider. */
function getThumbnailUrl(videoUrl: string): string | null {
  if (!videoUrl) return null;
  const provider = detectVideoProvider(videoUrl);
  if (provider === "youtube") return getYoutubeThumbnailUrl(videoUrl);
  if (provider === "facebook") return getFacebookThumbnailUrl(videoUrl);
  return null;
}

/** Returns the iframe-ready embed URL for any supported video provider. */
function getVideoEmbedUrl(videoUrl: string): string {
  if (!videoUrl) return "";
  const provider = detectVideoProvider(videoUrl);
  if (provider === "youtube") {
    return getYoutubeEmbedUrl(videoUrl) ?? videoUrl;
  }
  if (provider === "facebook") {
    return getFacebookEmbedUrl(videoUrl) ?? videoUrl;
  }
  // Unknown provider — pass the URL through as-is
  return videoUrl;
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
      <span
        className={cn(
          "relative aspect-video overflow-hidden bg-muted",
          !thumbnailUrl && "bg-gradient-to-br",
          !thumbnailUrl && thumbClass,
        )}
      >
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
  const rawPathname = usePathname();
  const pathname = rawPathname ?? "/";
  /* ✅ FIX: safe searchParams */
  const searchParamsRaw = useSearchParams();
  const searchParams = searchParamsRaw ?? new URLSearchParams();
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
      [
        ...new Set(
          baseItems.map((v) => Number.parseInt(v.dateIso.slice(0, 4), 10)),
        ),
      ]
        .filter(Number.isFinite)
        .sort((a, b) => b - a),
    [baseItems],
  );

  const fullList = useMemo(() => {
    const base = maxItems != null ? baseItems.slice(0, maxItems) : baseItems;
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
      router.replace(
        params.toString() ? `${pathname}?${params.toString()}` : pathname,
        { scroll: false },
      );
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
      router.replace(
        params.toString() ? `${pathname}?${params.toString()}` : pathname,
        {
          scroll: false,
        },
      );
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
    setOpenIndex((i) => (i === null ? i : (i - 1 + count) % count));
  }, [count]);

  const goNext = useCallback(() => {
    setOpenIndex((i) => (i === null ? i : (i + 1) % count));
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
        embedded ? "pb-12 pt-6 sm:pb-16 sm:pt-8" : "border-t border-border/40",
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
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis
          distinctio placeat iusto veniam corrupti amet et tenetur quidem
          voluptatem pariatur culpa, recusandae voluptatum quasi rem.
          Consequatur illo vel minus obcaecati!
        </p>
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
              thumbnailUrl={getThumbnailUrl(v.embedUrl)}
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
            {/* ── YouTube: native iframe embed ── */}
            {detectVideoProvider(active.embedUrl) === "youtube" ? (
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
            ) : (
              /* ── Facebook (and unknown): open-in-new-tab panel ── */
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                {/* Blurred thumbnail background */}
                {getThumbnailUrl(active.embedUrl) ? (
                  <img
                    src={getThumbnailUrl(active.embedUrl)!}
                    alt=""
                    aria-hidden
                    className="absolute inset-0 size-full scale-110 object-cover opacity-40 blur-md"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1877f2]/30 to-[#0c4a9e]/50" />
                )}
                {/* Overlay content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
                  {/* Facebook logo mark */}
                  <svg
                    viewBox="0 0 36 36"
                    className="size-12 shrink-0"
                    aria-hidden
                  >
                    <path
                      d="M36 18C36 8.059 27.941 0 18 0S0 8.059 0 18c0 8.984 6.582 16.43 15.188 17.77V23.203h-4.57V18h4.57v-3.961c0-4.512 2.687-7.008 6.805-7.008 1.972 0 4.032.352 4.032.352v4.43h-2.27c-2.238 0-2.934 1.387-2.934 2.812V18h4.992l-.797 5.203h-4.195v12.567C29.418 34.43 36 26.984 36 18z"
                      fill="#1877f2"
                    />
                    <path
                      d="M25.016 23.203L25.813 18h-4.992v-3.375c0-1.425.696-2.812 2.934-2.812h2.27V7.383S23.965 7.03 21.993 7.03c-4.118 0-6.805 2.496-6.805 7.008V18h-4.57v5.203h4.57v12.567a18.19 18.19 0 005.624 0V23.203h4.204z"
                      fill="#fff"
                    />
                  </svg>
                  <p className="text-base font-semibold text-white drop-shadow sm:text-lg">
                    {active.title}
                  </p>
                  <p className="max-w-sm text-sm text-white/80">
                    Facebook videos cannot be embedded directly. Watch it on Facebook instead.
                  </p>
                  <a
                    href={active.embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#1877f2] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#166fe5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877f2]/70 focus-visible:ring-offset-2"
                  >
                    Watch on Facebook
                    <ExternalLink className="size-4 shrink-0" aria-hidden />
                  </a>
                </div>
              </div>
            )}
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
