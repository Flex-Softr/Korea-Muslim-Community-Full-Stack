import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { listPhotoItems } from "@/lib/content/repository";
import { PhotoGallery } from "../components/photo-gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photo highlights from programmes, service, and community life across Korea.",
};

export default async function GalleryPage() {
  const data = await listPhotoItems({ page: 1, pageSize: 200 });
  return (
    <>
      <PageBanner
        title="Gallery"
        subtitle="Photo highlights from programmes, service, and community life. Select an image to view it larger with caption."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
      />
      <PhotoGallery embedded paginated sourceItems={data.items} />
    </>
  );
}
