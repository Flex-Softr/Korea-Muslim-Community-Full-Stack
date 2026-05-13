"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { blogPostPath } from "@/data/student-news";
import { pickCmsDetailDisplayText, type CmsTextDetailSource } from "@/lib/cms/cms-detail-locale-source";
import { useLanguage } from "@/components/providers/language-provider";

export function BlogLatestSidebarClient({ cards }: { cards: CmsTextDetailSource[] }) {
  const { lang, t } = useLanguage();

  const resolved = useMemo(() => {
    return cards.map((card) => {
      const f = pickCmsDetailDisplayText(card, lang);
      return { ...card, title: f.title, category: f.category };
    });
  }, [cards, lang]);

  if (resolved.length === 0) return null;

  return (
    <aside
      className="rounded-xl border border-border/80 bg-card shadow-sm ring-1 ring-black/[0.04] dark:ring-white/5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
      aria-labelledby="latest-blog-heading"
    >
      <div className="border-b border-border/60 px-5 py-4">
        <h2
          id="latest-blog-heading"
          className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
        >
          {t("pages.blog.sidebarHeading")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("pages.blog.sidebarSub")}</p>
      </div>
      <ul className="divide-y divide-border/60 p-2">
        {resolved.map((entry) => (
          <li key={entry.id}>
            <Link
              href={blogPostPath(entry.slug)}
              className="group flex gap-3 rounded-lg p-3 transition-colors hover:bg-muted/60"
            >
              <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-black/[0.06] dark:ring-white/10">
                <Image
                  src={entry.imageSrc}
                  alt=""
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="72px"
                />
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-[#2c7bb6] dark:group-hover:text-sky-400">
                  {entry.title}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <time dateTime={entry.dateIso}>{entry.date}</time>
                  <Badge variant="secondary" className="max-w-full truncate font-normal">
                    {entry.category}
                  </Badge>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="border-t border-border/60 p-4">
        <Link
          href="/blog"
          className="text-sm font-medium text-[#2c7bb6] underline-offset-4 hover:underline dark:text-sky-400"
        >
          {t("pages.blog.sidebarFooter")}
        </Link>
      </div>
    </aside>
  );
}
