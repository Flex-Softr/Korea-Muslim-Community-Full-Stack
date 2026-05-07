
import { HomeDonationCta } from "./components/home-donation-cta";
import { HomeQuickContact } from "./components/home-quick-contact";
import { HeroCarousel } from "./components/hero-carousel";
import { HomeWhoWeAre } from "./components/home-who-we-are";
import { OurActivitySection } from "./components/our-activity-section";
import { VideoGallery } from "./components/video-gallery";  
import { PhotoGallery } from "./components/photo-gallery";
import { listPhotoItems, listVideoItems } from "@/lib/content/repository";
import { OurBlogSection } from "./components/our-blog-section";

async function getCarousel() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/public/carosal`, {
    cache: "no-store",
  });

  const data = await res.json();
  return (data.items ?? []).sort((a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder);
}



export default async function HomePage() {
  const [photos, videos, slides] = await Promise.all([
    listPhotoItems({ page: 1, pageSize: 200 }),
    listVideoItems({ page: 1, pageSize: 200 }),
    getCarousel(),
  ]);

  return (
    <div className="flex flex-col">
      <HeroCarousel initialSlides={slides}/>
      <HomeWhoWeAre />
      <OurActivitySection secondaryItemLimit={6} />
      <OurBlogSection secondaryItemLimit={6} />
      <PhotoGallery maxItems={6} sourceItems={photos.items} />
      <VideoGallery maxItems={8} sourceItems={videos.items} />
      <HomeDonationCta />
      <HomeQuickContact />
    </div>
  );
}
