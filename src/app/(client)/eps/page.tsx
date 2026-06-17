import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { EpsTabs, type EpsPhotoItem } from "@/components/eps/eps-tabs";
import { listPhotoItems } from "@/lib/content/repository";
import { getRequestLang } from "@/lib/i18n/server-language";
import { serverT } from "@/lib/i18n/server-translate";

type PageProps = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: serverT(lang, "breadcrumbs.eps"),
    description: serverT(lang, "pages.eps.subtitle"),
  };
}

export default async function EPSPage(_props: PageProps) {
  const lang = await getRequestLang();
  const photoData = await listPhotoItems({ page: 1, pageSize: 60 }, lang);
  const epsPhotos: EpsPhotoItem[] = photoData.items
    .filter((item) => item.category.trim().toLowerCase() === "eps")
    .slice(0, 12)
    .map((item) => ({
      id: item.id,
      title: item.title,
      imageSrc: item.imageSrc,
      category: item.category,
    }));

  return (
    <>
      <PageBanner
        titleKey="breadcrumbs.eps"
        subtitleKey="pages.eps.subtitle"
        breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { labelKey: "breadcrumbs.eps" }]}
      />
      <EpsTabs photos={epsPhotos} />
    </>
  );
}
