import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { listCachedActivityItems } from "@/lib/content/repository";
import { ActivityListing } from "./activity-listing";
import { getRequestLang } from "@/lib/i18n/server-language";
import { serverT } from "@/lib/i18n/server-translate";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: serverT(lang, "common.activity"),
    description: serverT(lang, "pages.activity.subtitle"),
  };
}

type ActivityPageProps = {
  searchParams?: Promise<{
    category?: string;
    year?: string;
    page?: string;
  }>;
};

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    { cookies: [{ name: "lang", value: "bn" }], searchParams: { category: null, year: null, page: null } },
    { cookies: [{ name: "lang", value: "en" }], searchParams: { category: null, year: null, page: null } },
    { cookies: [{ name: "lang", value: "ko" }], searchParams: { category: null, year: null, page: null } },
  ],
};

export default async function ActivityPage({ searchParams }: ActivityPageProps) {
  const params = (await searchParams) ?? {};
  const category = params.category?.trim() || null;
  const yearParsed = params.year ? Number.parseInt(params.year, 10) : null;
  const year = yearParsed != null && Number.isFinite(yearParsed) ? yearParsed : null;
  const pageParsed = params.page ? Number.parseInt(params.page, 10) : 1;
  const page = Number.isFinite(pageParsed) ? pageParsed : 1;
  const lang = await getRequestLang();
  const all = await listCachedActivityItems(
    { page: 1, pageSize: 200 },
    lang,
    { maxRowsFromDb: 200 },
  );

  return (
    <>
      <PageBanner
        titleKey="common.activity"
        subtitleKey="pages.activity.subtitle"
        breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { labelKey: "breadcrumbs.activity" }]}
      />
      <ActivityListing
        items={all.items}
        categories={all.categories.map((c) => c.label)}
        years={all.years.map((y) => y.value)}
        initialCategory={category}
        initialYear={year}
        initialPage={page}
      />
    </>
  );
}