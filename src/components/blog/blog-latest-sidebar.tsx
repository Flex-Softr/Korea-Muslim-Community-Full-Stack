import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { blogPostPath, getLatestBlogPosts } from "@/data/student-news";

export function BlogLatestSidebar({
  excludeSlug,
  limit = 5,
}: {
  excludeSlug: string;
  limit?: number;
}) {
  const items = getLatestBlogPosts({ excludeSlug, limit });
  if (items.length === 0) {
    return null;
  }

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
          More from the blog
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Recent articles and announcements
        </p>
      </div>
      <ul className="divide-y divide-border/60 p-2">
        {items.map((entry) => (
          <li key={entry.id}>
            <Link
              href={blogPostPath(entry.slug)}
              className="group flex gap-3 rounded-lg p-3 transition-colors hover:bg-muted/60"
            >
              <div className="relative size-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-black/[0.06] dark:ring-white/10">
                <Image
                  src={entry.coverImage}
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
                  <Badge
                    variant="secondary"
                    className="max-w-full truncate font-normal"
                  >
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
          View full archive
        </Link>
      </div>
    </aside>
  );
}
