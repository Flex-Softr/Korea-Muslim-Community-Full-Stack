export type BlogComment = {
  id: string;
  slug: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string;
};

const commentsBySlug = new Map<string, BlogComment[]>();

export function listBlogComments(slug: string): BlogComment[] {
  return [...(commentsBySlug.get(slug) ?? [])].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
}

export function addBlogComment(input: Omit<BlogComment, "id" | "createdAt">): BlogComment {
  const next: BlogComment = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const current = commentsBySlug.get(input.slug) ?? [];
  commentsBySlug.set(input.slug, [...current, next]);
  return next;
}
