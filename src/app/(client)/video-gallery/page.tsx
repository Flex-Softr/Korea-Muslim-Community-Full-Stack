import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { listVideoItems } from "@/lib/content/repository";
import { VideoGallery } from "../components/video-gallery";
import { getRequestLang } from "@/lib/i18n/server-language";
import { getServerT, serverT } from "@/lib/i18n/server-translate";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: serverT(lang, "breadcrumbs.videos"),
    description: serverT(lang, "pages.videos.subtitle"),
  };
}

export default async function VideosPage() {
  const st = await getServerT();
  const data = await listVideoItems(
    { page: 1, pageSize: 200 },
    undefined,
    { maxRowsFromDb: 200 },
  );
  return (
    <>
      <PageBanner
        title={st("breadcrumbs.videos")}
        subtitle={st("pages.videos.subtitle")}
        breadcrumbs={[{ label: st("nav.home"), href: "/" }, { label: st("breadcrumbs.videos") }]}
      />
      <VideoGallery embedded paginated sourceItems={data.items} />
    </>
  );
}
