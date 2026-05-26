//export const dynamic = "force-dynamic";

import { Suspense } from "react";

import { HomeDonationCta } from "../components/home-donation-cta";
import { HomeQuickContact } from "../components/home-quick-contact";
import { HeroCarousel } from "../components/hero-carousel";
import { HomeWhoWeAre } from "../components/home-who-we-are";
import { OurActivitySection } from "../components/our-activity-section";
import { VideoGallery } from "../components/video-gallery";
import { PhotoGallery } from "../components/photo-gallery";
import { OurBlogSection } from "../components/our-blog-section";

import { Skeleton } from "@/components/ui/skeleton";

import { CMS_LIST_QUICK_PREVIEW_CAP } from "@/lib/content/constants";

import {
  listCachedActivityItems,
  listCachedBlogPosts,
  listCachedPhotoItems,
  listCachedVideoItems,
} from "@/lib/content/repository";

import { listPublicDashboardCarousel } from "@/lib/dashboard/store";

import { getRequestLang } from "@/lib/i18n/server-language";

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    {
      cookies: [{ name: "lang", value: "bn" }],
      searchParams: { category: null, year: null, page: null },
    },
    {
      cookies: [{ name: "lang", value: "en" }],
      searchParams: { category: null, year: null, page: null },
    },
    {
      cookies: [{ name: "lang", value: "ko" }],
      searchParams: { category: null, year: null, page: null },
    },
  ],
};

function HomeSectionFallback({ tiles = 4 }: { tiles?: number }) {
  return (
    <section
      className="border-b border-border/40 bg-background py-10 sm:py-12"
      aria-busy="true"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Skeleton className="h-7 w-44 sm:h-8" />

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: tiles }, (_, i) => (
            <Skeleton
              key={i}
              className="aspect-[16/10] w-full rounded-xl"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

async function HomeData() {
  const lang = await getRequestLang();

  const [
    carouselRows,
    activities,
    blogs,
    photos,
    videos,
  ] = await Promise.all([
    listPublicDashboardCarousel(),

    listCachedActivityItems(
      {
        page: 1,
        pageSize: CMS_LIST_QUICK_PREVIEW_CAP,
      },
      lang,
      {
        maxRowsFromDb: CMS_LIST_QUICK_PREVIEW_CAP,
        withFacets: false,
      }
    ),

    listCachedBlogPosts(
      {
        page: 1,
        pageSize: CMS_LIST_QUICK_PREVIEW_CAP,
      },
      lang,
      {
        maxRowsFromDb: CMS_LIST_QUICK_PREVIEW_CAP,
        withFacets: false,
      }
    ),

    listCachedPhotoItems(
      {
        page: 1,
        pageSize: CMS_LIST_QUICK_PREVIEW_CAP,
      },
      lang,
      {
        maxRowsFromDb: CMS_LIST_QUICK_PREVIEW_CAP,
        withFacets: false,
      }
    ),

    listCachedVideoItems(
      {
        page: 1,
        pageSize: CMS_LIST_QUICK_PREVIEW_CAP,
      },
      lang,
      {
        maxRowsFromDb: CMS_LIST_QUICK_PREVIEW_CAP,
        withFacets: false,
      }
    ),
  ]);

  const carouselSources = carouselRows.map((slide) => ({
    id: slide.id,
    imageUrl: slide.imageUrl,
    ctaHref: slide.ctaHref,
    sortOrder: slide.sortOrder,
    localeContent: slide.localeContent,
  }));

  return {
    carouselSources,
    activities,
    blogs,
    photos,
    videos,
  };
}

async function HomeContent() {
  const data = await HomeData();

  return (
    <>
      <HeroCarousel carouselSources={data.carouselSources} />

      <HomeWhoWeAre />

      <OurActivitySection
        secondaryItemLimit={6}
        sourceItems={data.activities.items}
      />

      <OurBlogSection
        secondaryItemLimit={6}
        sourceItems={data.blogs.items}
      />

      <PhotoGallery
        maxItems={6}
        sourceItems={data.photos.items}
      />

      <VideoGallery
        maxItems={8}
        sourceItems={data.videos.items}
      />

      <HomeDonationCta />

      <HomeQuickContact />
    </>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Suspense fallback={<HomeSectionFallback tiles={8} />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}







// import { Suspense } from "react";
// import { HomeDonationCta } from "../components/home-donation-cta";
// import { HomeQuickContact } from "../components/home-quick-contact";
// import { HeroCarousel } from "../components/hero-carousel";
// import { HomeWhoWeAre } from "../components/home-who-we-are";
// import { OurActivitySection } from "../components/our-activity-section";
// import { VideoGallery } from "../components/video-gallery";
// import { PhotoGallery } from "../components/photo-gallery";
// import { CMS_LIST_QUICK_PREVIEW_CAP } from "@/lib/content/constants";
// import {
//   listCachedActivityItems,
//   listCachedBlogPosts,
//   listCachedPhotoItems,
//   listCachedVideoItems,
// } from "@/lib/content/repository";
// import { listPublicDashboardCarousel } from "@/lib/dashboard/store";
// import { OurBlogSection } from "../components/our-blog-section";
// import { getRequestLang } from "@/lib/i18n/server-language";
// import { Skeleton } from "@/components/ui/skeleton";

// export const unstable_instant = {
//   prefetch: "runtime",
//   samples: [
//     { cookies: [{ name: "lang", value: "bn" }], searchParams: { category: null, year: null, page: null } },
//     { cookies: [{ name: "lang", value: "en" }], searchParams: { category: null, year: null, page: null } },
//     { cookies: [{ name: "lang", value: "ko" }], searchParams: { category: null, year: null, page: null } },
//   ],
// };

// function HomeSectionFallback({ tiles = 4 }: { tiles?: number }) {
//   return (
//     <section className="border-b border-border/40 bg-background py-10 sm:py-12" aria-busy="true">
//       <div className="mx-auto max-w-7xl px-4 sm:px-6">
//         <Skeleton className="h-7 w-44 sm:h-8" />
//         <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//           {Array.from({ length: tiles }, (_, i) => (
//             <Skeleton key={i} className="aspect-[16/10] w-full rounded-xl" />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// async function HomeHero() {
//   const carouselRows = await listPublicDashboardCarousel();
//   const carouselSources = carouselRows.map((slide) => ({
//     id: slide.id,
//     imageUrl: slide.imageUrl,
//     ctaHref: slide.ctaHref,
//     sortOrder: slide.sortOrder,
//     localeContent: slide.localeContent,
//   }));

//   return <HeroCarousel carouselSources={carouselSources} />;
// }

// async function HomeActivityPreview() {
//   const lang = await getRequestLang();
//   const activities = await listCachedActivityItems(
//     { page: 1, pageSize: CMS_LIST_QUICK_PREVIEW_CAP },
//     lang,
//     { maxRowsFromDb: CMS_LIST_QUICK_PREVIEW_CAP, withFacets: false },
//   );
//   return <OurActivitySection secondaryItemLimit={6} sourceItems={activities.items} />;
// }

// async function HomeBlogPreview() {
//   const lang = await getRequestLang();
//   const blogs = await listCachedBlogPosts(
//     { page: 1, pageSize: CMS_LIST_QUICK_PREVIEW_CAP },
//     lang,
//     { maxRowsFromDb: CMS_LIST_QUICK_PREVIEW_CAP, withFacets: false },
//   );
//   return <OurBlogSection secondaryItemLimit={6} sourceItems={blogs.items} />;
// }

// async function HomePhotoPreview() {
//   const lang = await getRequestLang();
//   const photos = await listCachedPhotoItems(
//     { page: 1, pageSize: CMS_LIST_QUICK_PREVIEW_CAP },
//     lang,
//     { maxRowsFromDb: CMS_LIST_QUICK_PREVIEW_CAP, withFacets: false },
//   );
//   return <PhotoGallery maxItems={6} sourceItems={photos.items} />;
// }

// async function HomeVideoPreview() {
//   const lang = await getRequestLang();
//   const videos = await listCachedVideoItems(
//     { page: 1, pageSize: CMS_LIST_QUICK_PREVIEW_CAP },
//     lang,
//     { maxRowsFromDb: CMS_LIST_QUICK_PREVIEW_CAP, withFacets: false },
//   );
//   return <VideoGallery maxItems={8} sourceItems={videos.items} />;
// }

// export default function HomePage() {
//   return (
//     <div className="flex flex-col">
//       <Suspense fallback={<HomeSectionFallback tiles={1} />}>
//         <HomeHero />
//       </Suspense>
//       <HomeWhoWeAre />
//       <Suspense fallback={<HomeSectionFallback />}>
//         <HomeActivityPreview />
//       </Suspense>
//       <Suspense fallback={<HomeSectionFallback />}>
//         <HomeBlogPreview />
//       </Suspense>
//       <Suspense fallback={<HomeSectionFallback tiles={6} />}>
//         <HomePhotoPreview />
//       </Suspense>
//       <Suspense fallback={<HomeSectionFallback tiles={8} />}>
//         <HomeVideoPreview />
//       </Suspense>
//       <HomeDonationCta />
//       <HomeQuickContact />
//     </div>
//   );
// }