/** Student / community blog feed for `/blog` — separate from activity routes and data. */
export type StudentNewsPost = {
  id: string;
  /** URL segment for `/blog/[slug]`. */
  slug: string;
  /** ISO date for `<time datetime>`, archive, and sorting. */
  dateIso: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  coverImage: string;
  /** Body for the article page; paragraphs separated by `\n\n`. */
  content: string;
};

export const STUDENT_NEWS_POSTS: StudentNewsPost[] = [];

export function blogPostPath(slug: string): string {
  return `/blog/${slug}`;
}

export function getBlogPostBySlug(slug: string): StudentNewsPost | undefined {
  return STUDENT_NEWS_POSTS.find((p) => p.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return STUDENT_NEWS_POSTS.map((p) => p.slug);
}

/** Descending by date (newest first). */
export function postsSortedByDate(): StudentNewsPost[] {
  return [...STUDENT_NEWS_POSTS].sort(
    (a, b) => b.dateIso.localeCompare(a.dateIso),
  );
}

export function getLatestBlogPosts({
  excludeSlug,
  limit = 5,
}: {
  excludeSlug: string;
  limit?: number;
}): StudentNewsPost[] {
  return postsSortedByDate()
    .filter((p) => p.slug !== excludeSlug)
    .slice(0, limit);
}
