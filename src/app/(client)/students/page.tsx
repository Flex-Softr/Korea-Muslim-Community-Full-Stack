import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { StudentTabs } from "@/components/students/student-tabs";
import { getRequestLang } from "@/lib/i18n/server-language";
import { serverT } from "@/lib/i18n/server-translate";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: serverT(lang, "nav.students"),
  };
}

export default async function StudentsPage() {
  return (
    <>
      <PageBanner
        titleKey="nav.students"
        breadcrumbs={[
          { labelKey: "nav.home", href: "/" },
          { labelKey: "nav.students" },
        ]}
      />
      <StudentTabs />
    </>
  );
}
