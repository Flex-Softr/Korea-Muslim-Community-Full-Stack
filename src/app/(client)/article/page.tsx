import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { listDashboardArticles } from "@/lib/dashboard/store";
import { ArticleNewsListing } from "@/app/(client)/components/article-news-listing";

export const metadata: Metadata = {
  title: "Articles",
  description: "Latest community articles.",
};

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default async function ArticlePage() {
  const rows = await listDashboardArticles();
  return (
    <>
      <PageBanner
        title="Articles"
        breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { label: "Articles" }]}
      />
      <ArticleNewsListing
        basePath="/article"
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
