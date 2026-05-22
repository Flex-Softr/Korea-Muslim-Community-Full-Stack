import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { listCachedVideoItems } from "@/lib/content/repository";
import { VideoGallery } from "../components/video-gallery";
import { getRequestLang } from "@/lib/i18n/server-language";
import { serverT } from "@/lib/i18n/server-translate";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: serverT(lang, "breadcrumbs.videos"),
    description: serverT(lang, "pages.videos.subtitle"),
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

export default async function VideosPage() {
  const lang = await getRequestLang();
  const data = await listCachedVideoItems(
    { page: 1, pageSize: 36 },
    lang,
    { maxRowsFromDb: 36 },
  );
  return (
    <>
      <PageBanner
        titleKey="breadcrumbs.videos"
        subtitleKey="pages.videos.subtitle"
        breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { labelKey: "breadcrumbs.videos" }]}
      />
      <VideoGallery embedded paginated sourceItems={data.items} />
    </>
  );
}
