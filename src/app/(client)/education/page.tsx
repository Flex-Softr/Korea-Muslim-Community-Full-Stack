import type { Metadata } from "next";
import { EducationTabs } from "@/components/education/education-tabs";
import { PageBanner } from "@/components/layout/page-banner";
import { getRequestLang } from "@/lib/i18n/server-language";
import { serverT } from "@/lib/i18n/server-translate";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: serverT(lang, "nav.education"),
  };
}

export default async function EducationPage() {
  return (
    <>
      <PageBanner
        titleKey="nav.education"
        breadcrumbs={[
          { labelKey: "nav.home", href: "/" },
          { labelKey: "nav.education" },
        ]}
      />
      <EducationTabs />
    </>
  );
}
