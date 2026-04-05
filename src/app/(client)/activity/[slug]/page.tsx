import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ActivityLatestSidebar } from "@/components/activity/activity-latest-sidebar";
import { PageBanner } from "@/components/layout/page-banner";
import { Badge } from "@/components/ui/badge";
import { getActivityBySlug, getAllActivitySlugs } from "@/data/activity-news";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllActivitySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getActivityBySlug(slug);
  if (!item) {
    return { title: "Activity" };
  }
  return {
    title: item.title,
    description: item.excerpt,
  };
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getActivityBySlug(slug);
  if (!item) {
    notFound();
  }

  const paragraphs = item.content.split("\n\n").filter(Boolean);

  return (
    <>
      <PageBanner
        title={item.title}
        subtitle={`${item.category} · ${item.date}`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Activity", href: "/activity" },
          { label: item.title },
        ]}
      />
      <article className="border-b border-border/40 bg-muted/15 py-10 dark:bg-muted/10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="min-w-0 lg:col-span-7 xl:col-span-8">
              <Link
                href="/activity"
                className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#2c7bb6] transition-colors hover:text-[#256fa3] dark:text-sky-400 dark:hover:text-sky-300"
              >
                <ArrowLeft className="size-4" aria-hidden />
                All activity
              </Link>

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <time dateTime={item.dateIso ?? undefined}>{item.date}</time>
                <span aria-hidden className="text-border">
                  ·
                </span>
                <Badge variant="secondary" className="font-normal">
                  {item.category}
                </Badge>
              </div>

              <div className="relative mt-6 aspect-[16/10] w-full overflow-hidden rounded-xl border border-border/80 bg-muted shadow-sm ring-1 ring-black/[0.04] dark:ring-white/5">
                <Image
                  src={item.imageSrc}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, min(896px, 58vw)"
                  priority
                />
              </div>

              <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
                {item.excerpt}
              </p>

              <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <p className="mt-10 text-sm text-muted-foreground">
                Looking for more?{" "}
                <Link
                  href="/activity"
                  className="font-medium text-[#2c7bb6] underline-offset-4 hover:underline dark:text-sky-400"
                >
                  Browse all activity updates
                </Link>
                .
              </p>
            </div>

            <div className="lg:col-span-5 xl:col-span-4">
              <ActivityLatestSidebar excludeSlug={slug} limit={5} />
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
