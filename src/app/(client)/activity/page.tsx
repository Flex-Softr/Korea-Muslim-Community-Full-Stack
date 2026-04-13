import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { listActivityItems } from "@/lib/content/repository";
import { ActivityListing } from "./activity-listing";

export const metadata: Metadata = {
  title: "Activity",
  description:
    "News and updates from Korea Muslim Community — programmes and outreach across Korea.",
};

type ActivityPageProps = {
  searchParams?: Promise<{
    category?: string;
    year?: string;
    page?: string;
  }>;
};

export default async function ActivityPage({ searchParams }: ActivityPageProps) {
  const params = (await searchParams) ?? {};
  const category = params.category?.trim() || null;
  const yearParsed = params.year ? Number.parseInt(params.year, 10) : null;
  const year = yearParsed != null && Number.isFinite(yearParsed) ? yearParsed : null;
  const pageParsed = params.page ? Number.parseInt(params.page, 10) : 1;
  const page = Number.isFinite(pageParsed) ? pageParsed : 1;
  const all = await listActivityItems({ page: 1, pageSize: 200 });

  return (
    <>
      <PageBanner
        title="Activity"
        subtitle="Reports and updates in a news format — programmes and outreach across Korea."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Activity" }]}
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
