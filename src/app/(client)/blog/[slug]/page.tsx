import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StudentBlogArticleDetail } from "@/components/cms/student-blog-article-detail";
import { CMS_LIST_QUICK_PREVIEW_CAP } from "@/lib/content/constants";
import {
  getBlogPost,
  listCachedBlogPosts,
} from "@/lib/content/repository";
import { toCmsTextDetailSource } from "@/lib/cms/cms-detail-locale-source";
import { getRequestLang } from "@/lib/i18n/server-language";
import { serverT } from "@/lib/i18n/server-translate";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) {
    const lang = await getRequestLang();
    return { title: serverT(lang, "common.blog") };
  }
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const requestLang = await getRequestLang();
  const [post, listResult] = await Promise.all([
    getBlogPost(slug, requestLang),
    listCachedBlogPosts(
      { page: 1, pageSize: CMS_LIST_QUICK_PREVIEW_CAP },
      requestLang,
      { maxRowsFromDb: CMS_LIST_QUICK_PREVIEW_CAP, withFacets: false },
    ),
  ]);
  if (!post) {
    notFound();
  }
  const sidebarItems = listResult.items.filter((p) => p.slug !== slug).slice(0, 5);

  const source = toCmsTextDetailSource({
    id: post.id,
    slug: post.slug,
    imageSrc: post.coverImage,
    dateIso: post.dateIso,
    date: post.date,
    title: post.title,
    category: post.category,
    body: post.content,
    localeContent: post.localeContent ?? null,
    resolvedForLang: requestLang,
  });

  const sidebarCards = sidebarItems.map((p) =>
    toCmsTextDetailSource({
      id: p.id,
      slug: p.slug,
      imageSrc: p.coverImage,
      dateIso: p.dateIso,
      date: p.date,
      title: p.title,
      category: p.category,
      body: p.content,
      localeContent: p.localeContent ?? null,
    }),
  );

  return (
    <StudentBlogArticleDetail key={slug} source={source} sidebarCards={sidebarCards} />
  );
}