import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { VideoGallery } from "../components/video-gallery";

export const metadata: Metadata = {
  title: "Videos",
  description:
    "Talks, programmes, and recordings from Korea Muslim Community.",
};

export default function VideosPage() {
  return (
    <>
      <PageBanner
        title="Videos"
        subtitle="Tap a thumbnail to play in a modal. Use on-screen arrows or keyboard left/right to move between videos."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Videos" }]}
      />
      <VideoGallery embedded paginated />
    </>
  );
}
