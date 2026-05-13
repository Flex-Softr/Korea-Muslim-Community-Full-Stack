import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { PublicBlogArticleDetail } from "@/components/cms/public-blog-article-detail";
import { getPublicBlogBySlug } from "@/lib/public-blog";
import { toCmsTextDetailSource } from "@/lib/cms/cms-detail-locale-source";
import { getRequestLang } from "@/lib/i18n/server-language";
import { serverT } from "@/lib/i18n/server-translate";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(dateIso: string): string {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicBlogBySlug(slug);
  if (!post) {
    const lang = await getRequestLang();
    return { title: serverT(lang, "common.blog") };
  }
  return {
    title: post.title,
    description: `${post.category} article by ${post.author.name}`,
  };
}

export default async function PublicBlogArticlePage({ params }: PageProps) {
  const session = await auth();
  const { slug } = await params;
  const post = await getPublicBlogBySlug(slug);
  if (!post) notFound();

  const source = toCmsTextDetailSource({
    id: post.slug,
    slug: post.slug,
    imageSrc: post.thumbnail ?? "/brand/logo.png",
    dateIso: post.dateIso,
    date: formatDate(post.dateIso),
    title: post.title,
    category: post.category,
    body: post.contentHtml,
    localeContent: post.localeContent ?? null,
  });

  return (
    <PublicBlogArticleDetail
      key={slug}
      source={source}
      dateLabel={formatDate(post.dateIso)}
      showHeroImage={!!post.thumbnail}
      authorName={post.author.name}
      slug={slug}
      canComment={!!session?.user?.id}
    />
  );
}
