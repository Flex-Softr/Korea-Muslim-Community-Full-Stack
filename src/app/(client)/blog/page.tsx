import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { listBlogPosts } from "@/lib/content/repository";
import { BlogListing } from "./blog-listing";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles, announcements, and student news from Korea Muslim Community.",
};

type BlogPageProps = {
  searchParams?: Promise<{
    category?: string;
    year?: string;
    page?: string;
  }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = (await searchParams) ?? {};
  const category = params.category?.trim() || null;
  const yearParsed = params.year ? Number.parseInt(params.year, 10) : null;
  const year = yearParsed != null && Number.isFinite(yearParsed) ? yearParsed : null;
  const pageParsed = params.page ? Number.parseInt(params.page, 10) : 1;
  const page = Number.isFinite(pageParsed) ? pageParsed : 1;

  const all = await listBlogPosts({ page: 1, pageSize: 200 });

  return (
    <>
      <PageBanner
        title="Blog"
        subtitle="Articles, announcements, and student life updates — browse by topic or year."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      />
      <BlogListing
        posts={all.items}
        categories={all.categories.map((c) => c.label)}
        initialCategory={category}
        initialYear={year}
        initialPage={page}
      />
    </>
  );
}
