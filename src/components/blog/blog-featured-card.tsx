"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { Badge } from "@/components/ui/badge";
import { blogPostPath, type StudentNewsPost } from "@/data/student-news";
import { useTranslatedFields } from "@/hooks/use-translated-fields";
import { cn } from "@/lib/utils";

type BlogFeaturedCardProps = {
  post: StudentNewsPost;
  className?: string;
};

export function BlogFeaturedCard({ post, className }: BlogFeaturedCardProps) {
  const { t } = useLanguage();
  const translated = useTranslatedFields({
    locale: post.locale,
    title: post.title,
    excerpt: post.excerpt,
  });

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg ring-1 ring-black/[0.04] transition-shadow hover:shadow-xl dark:bg-card/80 dark:ring-white/5",
        className,
      )}
    >
      <Link
        href={blogPostPath(post.slug)}
        className="grid min-h-0 md:grid-cols-12 md:gap-0"
      >
        <div className="relative aspect-[16/10] min-h-[200px] md:col-span-5 md:aspect-auto md:min-h-[280px] lg:col-span-5">
          <Image
            src={post.coverImage}
            alt=""
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 42vw"
            priority
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/20"
            aria-hidden
          />
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-8 md:col-span-7 lg:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2c7bb6] dark:text-sky-400">
            Latest
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <time dateTime={post.dateIso}>{post.date}</time>
            <span aria-hidden className="text-border">
              ·
            </span>
            <Badge variant="secondary" className="font-normal">
              {post.category}
            </Badge>
          </div>
          <h2 className="mt-3 text-balance text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-[#2c7bb6] sm:text-3xl dark:group-hover:text-sky-300">
            {translated.title}
          </h2>
          <p className="mt-4 line-clamp-3 text-pretty text-base leading-relaxed text-muted-foreground sm:line-clamp-4">
            {translated.excerpt}
          </p>
          <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2c7bb6] dark:text-sky-400">
            {t("common.readArticle")}
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </div>
      </Link>
    </article>
  );
}
