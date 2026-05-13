import { HomeDonationCta } from "./components/home-donation-cta";
import { HomeQuickContact } from "./components/home-quick-contact";
import { HeroCarousel } from "./components/hero-carousel";
import { HomeWhoWeAre } from "./components/home-who-we-are";
import { OurActivitySection } from "./components/our-activity-section";
import { VideoGallery } from "./components/video-gallery";
import { PhotoGallery } from "./components/photo-gallery";
import { CMS_LIST_QUICK_PREVIEW_CAP } from "@/lib/content/constants";
import {
  listActivityItems,
  listBlogPosts,
  listPhotoItems,
  listVideoItems,
} from "@/lib/content/repository";
import { listDashboardCarousel } from "@/lib/dashboard/store";
import { OurBlogSection } from "./components/our-blog-section";

export default async function HomePage() {
  const [blogs, activities, photos, videos, carouselRows] = await Promise.all([
    listBlogPosts(
      { page: 1, pageSize: CMS_LIST_QUICK_PREVIEW_CAP },
      undefined,
      { maxRowsFromDb: CMS_LIST_QUICK_PREVIEW_CAP },
    ),
    listActivityItems(
      { page: 1, pageSize: CMS_LIST_QUICK_PREVIEW_CAP },
      undefined,
      { maxRowsFromDb: CMS_LIST_QUICK_PREVIEW_CAP },
    ),
    listPhotoItems(
      { page: 1, pageSize: CMS_LIST_QUICK_PREVIEW_CAP },
      undefined,
      { maxRowsFromDb: CMS_LIST_QUICK_PREVIEW_CAP },
    ),
    listVideoItems(
      { page: 1, pageSize: CMS_LIST_QUICK_PREVIEW_CAP },
      undefined,
      { maxRowsFromDb: CMS_LIST_QUICK_PREVIEW_CAP },
    ),
    listDashboardCarousel(),
  ]);

  const carouselSources = [...carouselRows]
    .filter((item) => item.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((slide) => ({
      id: slide.id,
      imageUrl: slide.imageUrl,
      ctaHref: slide.ctaHref,
      sortOrder: slide.sortOrder,
      localeContent: slide.localeContent,
    }));

  return (
    <div className="flex flex-col">
      <HeroCarousel carouselSources={carouselSources} />

      <HomeWhoWeAre />
      <OurActivitySection secondaryItemLimit={6} sourceItems={activities.items} />
      <OurBlogSection secondaryItemLimit={6} sourceItems={blogs.items} />
      <PhotoGallery maxItems={6} sourceItems={photos.items} />
      <VideoGallery maxItems={8} sourceItems={videos.items} />
      <HomeDonationCta />
      <HomeQuickContact />
    </div>
  );
}
