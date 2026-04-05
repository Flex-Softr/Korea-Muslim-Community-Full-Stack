
import { HomeDonationCta } from "./components/home-donation-cta";
import { HomeQuickContact } from "./components/home-quick-contact";
import { HeroCarousel } from "./components/hero-carousel";
import { HomeWhoWeAre } from "./components/home-who-we-are";
import { OurActivitySection } from "./components/our-activity-section";
import { VideoGallery } from "./components/video-gallery";  
import { PhotoGallery } from "./components/photo-gallery";


export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroCarousel />
      <HomeWhoWeAre />
      <OurActivitySection secondaryItemLimit={6} />
      <PhotoGallery maxItems={6} />
      <VideoGallery maxItems={8} />
      <HomeDonationCta />
      <HomeQuickContact />
    </div>
  );
}
