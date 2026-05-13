import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { listPhotoItems } from "@/lib/content/repository";
import { PhotoGallery } from "../components/photo-gallery";
import { getRequestLang } from "@/lib/i18n/server-language";
import { getServerT, serverT } from "@/lib/i18n/server-translate";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: serverT(lang, "breadcrumbs.gallery"),
    description: serverT(lang, "pages.gallery.subtitle"),
  };
}

export default async function GalleryPage() {
  const st = await getServerT();
  const data = await listPhotoItems(
    { page: 1, pageSize: 200 },
    undefined,
    { maxRowsFromDb: 200 },
  );
  return (
    <>
      <PageBanner
        title={st("breadcrumbs.gallery")}
        subtitle={st("pages.gallery.subtitle")}
        breadcrumbs={[{ label: st("nav.home"), href: "/" }, { label: st("breadcrumbs.gallery") }]}
      />
      <PhotoGallery embedded paginated sourceItems={data.items} />
    </>
  );
}
