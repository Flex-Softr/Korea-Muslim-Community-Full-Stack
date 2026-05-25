"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";

const POLL_OPTIONS = [
  { id: "sidebar-poll-def-yes", key: "pageSidebar.pollDefinitelyYes" as const },
  { id: "sidebar-poll-yes", key: "pageSidebar.pollYes" as const },
  { id: "sidebar-poll-no", key: "pageSidebar.pollNo" as const },
  { id: "sidebar-poll-def-no", key: "pageSidebar.pollDefinitelyNo" as const },
] as const;

type SidebarItem = {
  id: string;
  title: string;
  image?: string;
  videoUrl?: string;
  slug: string;
};

type SidebarData = {
  articles: SidebarItem[];
  news: SidebarItem[];
  photos: SidebarItem[];
  videos: SidebarItem[];
};

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

function SidebarCarousel({
  items,
  alt,
  isVideo = false,
}: {
  items: SidebarItem[];
  alt: string;
  isVideo?: boolean;
}) {
  const [index, setIndex] = useState(0);

  const safeIndex = items.length > 0 ? index % items.length : 0;

  const active = items[safeIndex] ?? null;

  useEffect(() => {
    if (items.length < 2) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [items.length]);

  if (!active) {
    return (
      <div className="flex aspect-video w-full items-center justify-center bg-white/30 text-sm text-slate-700">
        No items found.
      </div>
    );
  }

  const thumbnail =
    isVideo && active.videoUrl
      ? getYoutubeThumbnailUrl(active.videoUrl)
      : active.image || "/placeholder.jpg";

  return (
    <div className="space-y-2">
      <a
        href={
          isVideo && active.videoUrl
            ? active.videoUrl
            : `/${active.slug}`
        }
        target={isVideo ? "_blank" : undefined}
        rel={isVideo ? "noopener noreferrer" : undefined}
        className="block"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-white/30">
          <Image
            src={thumbnail || "/placeholder.jpg"}
            alt={alt}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 640px) 100vw, 33vw"
          />

          {isVideo ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="ml-1 h-7 w-7 text-red-600"
                >
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              </div>
            </div>
          ) : null}
        </div>
      </a>

      <p className="line-clamp-2 text-base font-medium">
        {active.title}
      </p>

      {items.length > 1 ? (
        <div className="flex justify-center gap-1.5">
          {items.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Show item ${itemIndex + 1}`}
              className={`size-2 rounded-full ${
                itemIndex === safeIndex
                  ? "bg-[#0a1628]"
                  : "bg-white/70"
              }`}
              onClick={() => setIndex(itemIndex)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PageSidebar() {
  const { t } = useLanguage();

  const [data, setData] = useState<SidebarData>({
    articles: [],
    news: [],
    photos: [],
    videos: [],
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/public/page-sidebar", {
          cache: "no-store",
        });

        const next = (await res.json()) as SidebarData;

        if (!res.ok || cancelled) return;

        setData({
          articles: next.articles ?? [],
          news: next.news ?? [],
          photos: next.photos ?? [],
          videos: next.videos ?? [],
        });
      } catch {
        // silent fail
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="border-1 p-2 shadow-sm shadow-gray-400">
      <section>
        <h2 className="bg-[#0a1628] p-3 text-lg text-white">
          {t("pageSidebar.pollTitle")}
        </h2>

        <div className="bg-[#5bc0de] p-3">
          <p className="pb-4 text-xl">
            {t("pageSidebar.pollQuestion")}
          </p>

          {POLL_OPTIONS.map((opt) => (
            <div key={opt.id} className="flex gap-2 pb-1">
              <input
                type="radio"
                name="sidebar-poll"
                id={opt.id}
              />

              <label
                className="text-lg"
                htmlFor={opt.id}
              >
                {t(opt.key)}
              </label>
            </div>
          ))}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              className="rounded-sm bg-blue-500 p-2 text-white"
            >
              {t("pageSidebar.voteButton")}
            </button>

            <button
              type="button"
              className="rounded-sm bg-[#0a1628] p-2 text-white"
            >
              {t("pageSidebar.resultButton")}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-sm">
        <h2 className="bg-[#0a1628] p-3 text-lg text-white">
          {t("pageSidebar.notableArticlesTitle")}
        </h2>

        <div className="flex flex-col gap-2 space-y-4 bg-[#5bc0de] px-4 py-6">
          {data.articles.map((item) => (
            <a
              key={item.id}
              href={`/article/${item.slug}`}
              className="text-xl hover:underline"
            >
              {item.title}
            </a>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-sm">
        <h2 className="bg-[#0a1628] p-3 text-lg text-white">
          {t("pageSidebar.notableNewsTitle")}
        </h2>

        <div className="flex flex-col gap-2 space-y-4 bg-[#5bc0de] px-4 py-6">
          {data.news.map((item) => (
            <a
              key={item.id}
              href={`/news/${item.slug}`}
              className="text-xl hover:underline"
            >
              {item.title}
            </a>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-sm">
        <h2 className="bg-[#0a1628] p-3 text-lg text-white">
          {t("pageSidebar.notableVideosTitle")}
        </h2>

        <div className="bg-[#5bc0de] px-4 py-6">
          <SidebarCarousel
            items={data.videos}
            alt={t("pageSidebar.featuredMediaAlt")}
            isVideo
          />
        </div>
      </section>

      <section className="mt-4 rounded-sm">
        <h2 className="bg-[#0a1628] p-3 text-lg text-white">
          {t("pageSidebar.notablePhotosTitle")}
        </h2>

        <div className="bg-[#5bc0de] px-4 py-6">
          <SidebarCarousel
            items={data.photos}
            alt={t("pageSidebar.featuredMediaAlt")}
          />
        </div>
      </section>
    </div>
  );
}


// "use client";

// import Image from "next/image";
// import { useEffect, useState } from "react";
// import { useLanguage } from "@/components/providers/language-provider";

// const POLL_OPTIONS = [
//   { id: "sidebar-poll-def-yes", key: "pageSidebar.pollDefinitelyYes" as const },
//   { id: "sidebar-poll-yes", key: "pageSidebar.pollYes" as const },
//   { id: "sidebar-poll-no", key: "pageSidebar.pollNo" as const },
//   { id: "sidebar-poll-def-no", key: "pageSidebar.pollDefinitelyNo" as const },
// ] as const;

// type SidebarItem = {
//   id: string;
//   title: string;
//   image?: string;
//   embedUrl?: string;
//   slug: string;
// };

// type SidebarData = {
//   articles: SidebarItem[];
//   news: SidebarItem[];
//   photos: SidebarItem[];
//   videos: SidebarItem[];
// };

// function resolveYoutubeVideoId(videoUrl: string): string | null {
//   if (!videoUrl) return null;

//   const normalizedUrl = videoUrl.trim();

//   if (!normalizedUrl) return null;

//   const resolveFromUrl = (urlValue: URL): string | null => {
//     const host = urlValue.hostname.replace(/^www\./, "").toLowerCase();

//     const path = urlValue.pathname;

//     const segments = path.split("/").filter(Boolean);

//     if (host === "youtu.be") {
//       return segments[0] ?? null;
//     }

//     if (host === "youtube.com" || host === "m.youtube.com") {
//       if (path === "/watch") {
//         return urlValue.searchParams.get("v");
//       }

//       if (segments[0] === "embed" || segments[0] === "shorts") {
//         return segments[1] ?? null;
//       }
//     }

//     return null;
//   };

//   try {
//     return resolveFromUrl(new URL(normalizedUrl));
//   } catch {
//     try {
//       return resolveFromUrl(new URL(`https://${normalizedUrl}`));
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

//   if (videoUrl.includes("?")) {
//     return `${videoUrl}&rel=0`;
//   }

//   return `${videoUrl}?rel=0`;
// }

// function SidebarCarousel({
//   items,
//   alt,
//   isVideo = false,
// }: {
//   items: SidebarItem[];
//   alt: string;
//   isVideo?: boolean;
// }) {
//   const [index, setIndex] = useState(0);

//   const safeIndex = items.length > 0 ? index % items.length : 0;

//   const active = items[safeIndex] ?? null;

//   useEffect(() => {
//     if (items.length < 2) return;

//     const timer = window.setInterval(() => {
//       setIndex((current) => (current + 1) % items.length);
//     }, 7000);

//     return () => window.clearInterval(timer);
//   }, [items.length]);

//   if (!active) {
//     return (
//       <div className="flex aspect-video w-full items-center justify-center bg-white/30 text-sm text-slate-700">
//         No items found.
//       </div>
//     );
//   }

//   const thumbnail =
//     active.image ||
//     (active.embedUrl
//       ? getYoutubeThumbnailUrl(active.embedUrl)
//       : null) ||
//     "/placeholder.jpg";

//   return (
//     <div className="space-y-2">
//       <div className="relative aspect-video w-full overflow-hidden bg-white/30">
//       <a
//   href={active.embedUrl || "#"}
//   target="_blank"
//   rel="noopener noreferrer"
//   className="relative block h-full w-full"
// >
//   <Image
//     src={thumbnail}
//     alt={alt}
//     fill
//     className="object-cover"
//     sizes="(max-width: 640px) 100vw, 33vw"
//   />

//   {isVideo ? (
//     <div className="absolute inset-0 flex items-center justify-center bg-black/20">
//       <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           viewBox="0 0 24 24"
//           fill="currentColor"
//           className="ml-1 h-7 w-7 text-red-600"
//         >
//           <path d="M8 5.14v14l11-7-11-7z" />
//         </svg>
//       </div>
//     </div>
//   ) : null}
// </a>
//       </div>

//       <p className="line-clamp-2 text-base font-medium">
//         {active.title}
//       </p>

//       {items.length > 1 ? (
//         <div className="flex justify-center gap-1.5">
//           {items.map((item, itemIndex) => (
//             <button
//               key={item.id}
//               type="button"
//               aria-label={`Show item ${itemIndex + 1}`}
//               className={`size-2 rounded-full ${
//                 itemIndex === safeIndex
//                   ? "bg-[#0a1628]"
//                   : "bg-white/70"
//               }`}
//               onClick={() => setIndex(itemIndex)}
//             />
//           ))}
//         </div>
//       ) : null}
//     </div>
//   );
// }

// export function PageSidebar() {
//   const { t } = useLanguage();

//   const [data, setData] = useState<SidebarData>({
//     articles: [],
//     news: [],
//     photos: [],
//     videos: [],
//   });

//   useEffect(() => {
//     let cancelled = false;

//     const load = async () => {
//       try {
//         const res = await fetch("/api/public/page-sidebar", {
//           cache: "no-store",
//         });

//         const next = (await res.json()) as SidebarData;

//         if (!res.ok || cancelled) return;

//         setData({
//           articles: next.articles ?? [],
//           news: next.news ?? [],
//           photos: next.photos ?? [],
//           videos: next.videos ?? [],
//         });
//       } catch {
//         // silent fail
//       }
//     };

//     void load();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   console.log(data);
  

//   return (
//     <div className="border-1 p-2 shadow-sm shadow-gray-400">
//       <section>
//         <h2 className="bg-[#0a1628] p-3 text-lg text-white">
//           {t("pageSidebar.pollTitle")}
//         </h2>

//         <div className="bg-[#5bc0de] p-3">
//           <p className="pb-4 text-xl">
//             {t("pageSidebar.pollQuestion")}
//           </p>

//           {POLL_OPTIONS.map((opt) => (
//             <div key={opt.id} className="flex gap-2 pb-1">
//               <input
//                 type="radio"
//                 name="sidebar-poll"
//                 id={opt.id}
//               />

//               <label
//                 className="text-lg"
//                 htmlFor={opt.id}
//               >
//                 {t(opt.key)}
//               </label>
//             </div>
//           ))}

//           <div className="flex gap-2 pt-4">
//             <button
//               type="button"
//               className="rounded-sm bg-blue-500 p-2 text-white"
//             >
//               {t("pageSidebar.voteButton")}
//             </button>

//             <button
//               type="button"
//               className="rounded-sm bg-[#0a1628] p-2 text-white"
//             >
//               {t("pageSidebar.resultButton")}
//             </button>
//           </div>
//         </div>
//       </section>

//       <section className="mt-4 rounded-sm">
//         <h2 className="bg-[#0a1628] p-3 text-lg text-white">
//           {t("pageSidebar.notableArticlesTitle")}
//         </h2>

//         <div className="flex flex-col gap-2 space-y-4 bg-[#5bc0de] px-4 py-6">
//           {data.articles.map((item) => (
//             <a
//               key={item.id}
//               href={`/article/${item.slug}`}
//               className="text-xl hover:underline"
//             >
//               {item.title}
//             </a>
//           ))}
//         </div>
//       </section>

//       <section className="mt-4 rounded-sm">
//         <h2 className="bg-[#0a1628] p-3 text-lg text-white">
//           {t("pageSidebar.notableNewsTitle")}
//         </h2>

//         <div className="flex flex-col gap-2 space-y-4 bg-[#5bc0de] px-4 py-6">
//           {data.news.map((item) => (
//             <a
//               key={item.id}
//               href={`/news/${item.slug}`}
//               className="text-xl hover:underline"
//             >
//               {item.title}
//             </a>
//           ))}
//         </div>
//       </section>

//       <section className="mt-4 rounded-sm">
//         <h2 className="bg-[#0a1628] p-3 text-lg text-white">
//           {t("pageSidebar.notableVideosTitle")}
//         </h2>

//         <div className="flex flex-col gap-2 space-y-4 bg-[#5bc0de] px-4 py-6">
//           <SidebarCarousel
//             items={data.videos}
//             alt={t("pageSidebar.featuredMediaAlt")}
//             isVideo
//           />
//         </div>
//       </section>

//       <section className="mt-4 rounded-sm">
//         <h2 className="bg-[#0a1628] p-3 text-lg text-white">
//           {t("pageSidebar.notablePhotosTitle")}
//         </h2>

//         <div className="flex flex-col gap-2 space-y-4 bg-[#5bc0de] px-4 py-6">
//           <SidebarCarousel
//             items={data.photos}
//             alt={t("pageSidebar.featuredMediaAlt")}
//           />
//         </div>
//       </section>
//     </div>
//   );
// }


