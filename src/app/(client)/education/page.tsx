import type { Metadata } from "next";
import { EducationTabs, type EducationPhotoItem } from "@/components/education/education-tabs";
import { PageBanner } from "@/components/layout/page-banner";
import { listPhotoItems } from "@/lib/content/repository";
import { getRequestLang } from "@/lib/i18n/server-language";
import { serverT } from "@/lib/i18n/server-translate";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: serverT(lang, "nav.education"),
  };
}

export default async function EducationPage() {
  const lang = await getRequestLang();
  const photoData = await listPhotoItems({ page: 1, pageSize: 60 }, lang);
  const educationPhotos: EducationPhotoItem[] = photoData.items
    .filter((item) => item.category.trim().toLowerCase() === "education")
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
        titleKey="nav.education"
        breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { labelKey: "nav.education" }]}
      />
      <EducationTabs photos={educationPhotos} />
    </>
  );
}
