import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { StudentTabs, type StudentPhotoItem } from "@/components/students/student-tabs";
import { listPhotoItems } from "@/lib/content/repository";
import { getRequestLang } from "@/lib/i18n/server-language";
import { serverT } from "@/lib/i18n/server-translate";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: serverT(lang, "nav.students"),
  };
}

export default async function StudentsPage() {
  const lang = await getRequestLang();
  const photoData = await listPhotoItems({ page: 1, pageSize: 60 }, lang);
  const studentPhotos: StudentPhotoItem[] = photoData.items
    .filter((item) => {
      const category = item.category.trim().toLowerCase();
      return category === "student" || category === "students";
    })
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
        titleKey="nav.students"
        breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { labelKey: "nav.students" }]}
      />
      <StudentTabs photos={studentPhotos} />
    </>
  );
}
