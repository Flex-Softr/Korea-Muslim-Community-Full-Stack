import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { listDashboardNewsItems } from "@/lib/dashboard/store";
import { ArticleNewsListing } from "@/app/(client)/components/article-news-listing";

export const metadata: Metadata = {
  title: "News",
  description: "Latest community news.",
};

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default async function NewsPage() {
  const rows = await listDashboardNewsItems();
  return (
    <>
      <PageBanner
        titleKey="breadcrumbs.news"
        breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { labelKey: "breadcrumbs.news" }]}
      />
      <ArticleNewsListing
        basePath="/news"
        items={rows.map((row) => ({
          id: row.id,
          locale: "en",
          slug: row.slug,
          dateIso: row.dateIso,
          date: new Date(row.dateIso).toLocaleDateString(),
          category: row.category,
          title: row.title,
          excerpt: stripHtml(row.description ?? "").slice(0, 180),
          imageSrc: row.coverImage || "/brand/logo.png",
          content: row.description ?? "",
          localeContent: row.localeContent,
        }))}
      />
    </>
  );
}
