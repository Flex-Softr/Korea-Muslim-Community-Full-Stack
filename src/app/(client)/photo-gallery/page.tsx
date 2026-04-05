import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { PhotoGallery } from "../components/photo-gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photo highlights from programmes, service, and community life across Korea.",
};

export default function GalleryPage() {
  return (
    <>
      <PageBanner
        title="Gallery"
        subtitle="Photo highlights from programmes, service, and community life. Select an image to view it larger with caption."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />
      <PhotoGallery embedded paginated />
    </>
  );
}
