import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { listCachedBlogPosts } from "@/lib/content/repository";
import { BlogListing } from "./blog-listing";
import { getRequestLang } from "@/lib/i18n/server-language";
import { serverT } from "@/lib/i18n/server-translate";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: serverT(lang, "common.blog"),
    description: serverT(lang, "pages.blog.subtitle"),
  };
}

type BlogPageProps = {
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

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = (await searchParams) ?? {};
  const category = params.category?.trim() || null;
  const yearParsed = params.year ? Number.parseInt(params.year, 10) : null;
  const year = yearParsed != null && Number.isFinite(yearParsed) ? yearParsed : null;
  const pageParsed = params.page ? Number.parseInt(params.page, 10) : 1;
  const page = Number.isFinite(pageParsed) ? pageParsed : 1;

  const lang = await getRequestLang();
  const all = await listCachedBlogPosts(
    { page: 1, pageSize: 200 },
    lang,
    { maxRowsFromDb: 200 },
  );

  return (
    <>
      <PageBanner
        titleKey="common.blog"
        subtitleKey="pages.blog.subtitle"
        breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { labelKey: "common.blog" }]}
      />
      <BlogListing
        posts={all.items}
        categories={all.categories.map((c) => c.label)}
        years={all.years.map((y) => y.value)}
        initialCategory={category}
        initialYear={year}
        initialPage={page}
      />
    </>
  );
}