
import { HomeDonationCta } from "./components/home-donation-cta";
import { HomeQuickContact } from "./components/home-quick-contact";
import { HeroCarousel } from "./components/hero-carousel";
import { HomeWhoWeAre } from "./components/home-who-we-are";
import { OurActivitySection } from "./components/our-activity-section";
import { VideoGallery } from "./components/video-gallery";  
import { PhotoGallery } from "./components/photo-gallery";
import { listPhotoItems, listVideoItems } from "@/lib/content/repository";


export default async function HomePage() {
  const [photos, videos] = await Promise.all([
    listPhotoItems({ page: 1, pageSize: 200 }),
    listVideoItems({ page: 1, pageSize: 200 }),
  ]);

  return (
    <div className="flex flex-col">
      <HeroCarousel />
      <HomeWhoWeAre />
      <OurActivitySection secondaryItemLimit={6} />
      <PhotoGallery maxItems={6} sourceItems={photos.items} />
      <VideoGallery maxItems={8} sourceItems={videos.items} />
      <HomeDonationCta />
      <HomeQuickContact />
    </div>
  );
}
