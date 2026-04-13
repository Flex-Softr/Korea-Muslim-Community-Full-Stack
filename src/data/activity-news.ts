export type ActivityNewsItem = {
  id: string;
  /** URL segment for `/activity/[slug]` — not shared with blog routes. */
  slug: string;
  /** ISO date for `<time datetime>` when available. */
  dateIso?: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  imageSrc: string;
  /** Body copy for the activity detail page (paragraphs separated by `\n\n`). */
  content: string;
};

/** Featured story on the home / “our activity” section (also has its own detail URL). */
export const ACTIVITY_FEATURED: ActivityNewsItem | null = null;

export const ACTIVITY_NEWS: ActivityNewsItem[] = [];

const bySlug = new Map<string, ActivityNewsItem>();

/** Single ordered list: featured first in data, then listing items (no duplicate slugs). */
export const ALL_ACTIVITY_ITEMS: ActivityNewsItem[] = [
  ...(ACTIVITY_FEATURED ? [ACTIVITY_FEATURED] : []),
  ...ACTIVITY_NEWS,
];

for (const item of ALL_ACTIVITY_ITEMS) {
  bySlug.set(item.slug, item);
}

/** Resolve an activity story for detail pages — includes the featured item and listing items only (no duplicate). */
export function getActivityBySlug(slug: string): ActivityNewsItem | undefined {
  return bySlug.get(slug);
}

/**
 * Newest-first activity items for sidebars (by `dateIso`, then listing order).
 * Excludes the current detail slug when provided.
 */
export function getLatestActivityItems({
  excludeSlug,
  limit = 5,
}: {
  excludeSlug?: string;
  limit?: number;
}): ActivityNewsItem[] {
  const filtered = excludeSlug
    ? ALL_ACTIVITY_ITEMS.filter((item) => item.slug !== excludeSlug)
    : [...ALL_ACTIVITY_ITEMS];

  const sorted = [...filtered].sort((a, b) => {
    const da = a.dateIso ?? "";
    const db = b.dateIso ?? "";
    if (da !== db) {
      return db.localeCompare(da);
    }
    return 0;
  });

  return sorted.slice(0, limit);
}

export function getAllActivitySlugs(): string[] {
  return Array.from(bySlug.keys());
}

export function activityDetailPath(slug: string): string {
  return `/activity/${slug}`;
}

/** Distinct categories on the activity listing page (`ACTIVITY_NEWS` only). */
export function getActivityListingCategories(): string[] {
  const set = new Set(ACTIVITY_NEWS.map((item) => item.category));
  return [...set].sort((a, b) => a.localeCompare(b));
}
