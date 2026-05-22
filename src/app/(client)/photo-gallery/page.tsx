import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { listCachedPhotoItems } from "@/lib/content/repository";
import { PhotoGallery } from "../components/photo-gallery";
import { getRequestLang } from "@/lib/i18n/server-language";
import { serverT } from "@/lib/i18n/server-translate";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: serverT(lang, "breadcrumbs.gallery"),
    description: serverT(lang, "pages.gallery.subtitle"),
  };
}

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    { cookies: [{ name: "lang", value: "bn" }], searchParams: { category: null, year: null, page: null } },
    { cookies: [{ name: "lang", value: "en" }], searchParams: { category: null, year: null, page: null } },
    { cookies: [{ name: "lang", value: "ko" }], searchParams: { category: null, year: null, page: null } },
  ],
};

export default async function GalleryPage() {
  const lang = await getRequestLang();
  const data = await listCachedPhotoItems(
    { page: 1, pageSize: 36 },
    lang,
    { maxRowsFromDb: 36 },
  );
  return (
    <>
      <PageBanner
        titleKey="breadcrumbs.gallery"
        subtitleKey="pages.gallery.subtitle"
        breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { labelKey: "breadcrumbs.gallery" }]}
      />
      <PhotoGallery embedded paginated sourceItems={data.items} />
    </>
  );
}
