import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { PublicBlogComments } from "@/components/blog/public-blog-comments";
import { PageBanner } from "@/components/layout/page-banner";
import { Badge } from "@/components/ui/badge";
import { getPublicBlogBySlug } from "@/lib/public-blog";

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
  if (!post) return { title: "Blog" };
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

  return (
    <>
      <PageBanner
        title={post.title}
        subtitle={`${post.category} · ${formatDate(post.dateIso)}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blogs", href: "/blog" },
          { label: post.title },
        ]}
      />
      <article className="border-b border-border/40 bg-muted/15 py-10 dark:bg-muted/10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#2c7bb6] transition-colors hover:text-[#256fa3] dark:text-sky-400 dark:hover:text-sky-300"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to blog archive
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <time dateTime={post.dateIso}>{formatDate(post.dateIso)}</time>
            <span aria-hidden className="text-border">·</span>
            <Badge variant="secondary" className="font-normal">{post.category}</Badge>
            <span aria-hidden className="text-border">·</span>
            <span>By {post.author.name}</span>
          </div>

          {post.thumbnail ? (
            <div className="relative mt-6 aspect-[16/10] w-full overflow-hidden rounded-xl border border-border/80 bg-muted shadow-sm ring-1 ring-black/[0.04] dark:ring-white/5">
              <Image src={post.thumbnail} alt="" fill className="object-cover" sizes="100vw" priority />
            </div>
          ) : null}

          <div
            className="prose prose-sm mt-8 max-w-none dark:prose-invert sm:prose-base"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          <PublicBlogComments slug={slug} canComment={!!session?.user?.id} />
        </div>
      </article>
    </>
  );
}
