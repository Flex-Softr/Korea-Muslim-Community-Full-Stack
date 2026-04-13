import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { activityDetailPath } from "@/data/activity-news";
import { listActivityItems } from "@/lib/content/repository";

export async function ActivityLatestSidebar({
  excludeSlug,
  limit = 5,
}: {
  excludeSlug: string;
  limit?: number;
}) {
  const { items: all } = await listActivityItems({ page: 1, pageSize: 200 });
  const items = all.filter((entry) => entry.slug !== excludeSlug).slice(0, limit);
  if (items.length === 0) {
    return null;
  }

  return (
    <aside
      className="rounded-xl border border-border/80 bg-card shadow-sm ring-1 ring-black/[0.04] dark:ring-white/5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
      aria-labelledby="latest-activity-heading"
    >
      <div className="border-b border-border/60 px-5 py-4">
        <h2
          id="latest-activity-heading"
          className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
        >
          Latest activity
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          More updates from the community
        </p>
      </div>
      <ul className="divide-y divide-border/60 p-2">
        {items.map((entry) => (
          <li key={entry.id}>
            <Link
              href={activityDetailPath(entry.slug)}
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
                  <time dateTime={entry.dateIso ?? undefined}>{entry.date}</time>
                  <Badge
                    variant="secondary"
                    className="max-w-full truncate px-1.5 py-0 text-[0.65rem] font-normal"
                  >
                    {entry.category}
                  </Badge>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="border-t border-border/60 px-5 py-4">
        <Link
          href="/activity"
          className="text-sm font-medium text-[#2c7bb6] transition-colors hover:text-[#256fa3] dark:text-sky-400 dark:hover:text-sky-300"
        >
          View all activity →
        </Link>
      </div>
    </aside>
  );
}
