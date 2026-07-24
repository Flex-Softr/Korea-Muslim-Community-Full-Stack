import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { EpsTabs } from "@/components/eps/eps-tabs";
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
  return (
    <>
      <PageBanner
        titleKey="breadcrumbs.eps"
        subtitleKey="pages.eps.subtitle"
        breadcrumbs={[
          { labelKey: "nav.home", href: "/" },
          { labelKey: "breadcrumbs.eps" },
        ]}
      />
      <EpsTabs />
    </>
  );
}
