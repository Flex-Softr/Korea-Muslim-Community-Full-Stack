import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BlogLatestSidebar } from "@/components/blog/blog-latest-sidebar";
import { PageBanner } from "@/components/layout/page-banner";
import { Badge } from "@/components/ui/badge";
import { getBlogPost } from "@/lib/content/repository";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function richTextToPlainText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) {
    return { title: "Blog" };
  }
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) {
    notFound();
  }

  const plainContent = richTextToPlainText(post.content);
  const paragraphs = plainContent
    .split(/(?:\r?\n){2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <PageBanner
        title={post.title}
        subtitle={`${post.category} · ${post.date}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />
      <article className="border-b border-border/40 bg-muted/15 py-10 dark:bg-muted/10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="min-w-0 lg:col-span-7 xl:col-span-8">
              <Link
                href="/blog"
                className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#2c7bb6] transition-colors hover:text-[#256fa3] dark:text-sky-400 dark:hover:text-sky-300"
              >
                <ArrowLeft className="size-4" aria-hidden />
                Blog archive
              </Link>

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <time dateTime={post.dateIso}>{post.date}</time>
                <span aria-hidden className="text-border">
                  ·
                </span>
                <Badge variant="secondary" className="font-normal">
                  {post.category}
                </Badge>
              </div>

              <div className="relative mt-6 aspect-[16/10] w-full overflow-hidden rounded-xl border border-border/80 bg-muted shadow-sm ring-1 ring-black/[0.04] dark:ring-white/5">
                <Image
                  src={post.coverImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, min(896px, 58vw)"
                  priority
                />
              </div>

              <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>

              <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground">
                {paragraphs.length > 0 ? (
                  paragraphs.map((p, i) => <p key={i}>{p}</p>)
                ) : (
                  <p>{plainContent}</p>
                )}
              </div>

              <p className="mt-10 text-sm text-muted-foreground">
                <Link
                  href="/blog"
                  className="font-medium text-[#2c7bb6] underline-offset-4 hover:underline dark:text-sky-400"
                >
                  Browse the full blog archive
                </Link>
                .
              </p>
            </div>

            <div className="lg:col-span-5 xl:col-span-4">
              <BlogLatestSidebar excludeSlug={slug} limit={5} />
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
