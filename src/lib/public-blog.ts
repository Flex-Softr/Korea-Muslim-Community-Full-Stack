import { prisma } from "@/lib/prisma";
import { getPublishedDashboardBlogBySlug } from "@/lib/dashboard/store";
import { getBlogPostBySlug } from "@/data/student-news";

export type PublicBlogPost = {
  slug: string;
  title: string;
  dateIso: string;
  category: string;
  contentHtml: string;
  thumbnail: string | null;
  author: {
    id: string | null;
    name: string;
    email: string | null;
  };
};

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function paragraphsToHtml(content: string): string {
  return content
    .split("\n\n")
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");
}

function sanitizeHtml(input: string): string {
  // Prevent client-side React warning and unsafe execution from injected scripts.
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<script[\s\S]*?\/>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, "");
}

export async function getPublicBlogBySlug(slug: string): Promise<PublicBlogPost | null> {
  const dashboardPost = await getPublishedDashboardBlogBySlug(slug);
  if (dashboardPost) {
    let authorName = "KMC Member";
    let authorEmail: string | null = null;
    if (dashboardPost.createdById) {
      const author = await prisma.user.findUnique({
        where: { id: dashboardPost.createdById },
        select: { id: true, name: true, email: true },
      });
      authorName = author?.name?.trim() || author?.email || authorName;
      authorEmail = author?.email || null;
    }
    return {
      slug,
      title: dashboardPost.title,
      dateIso: dashboardPost.dateIso,
      category: dashboardPost.category,
      contentHtml: sanitizeHtml(dashboardPost.description || "<p></p>"),
      thumbnail: dashboardPost.coverImage || null,
      author: {
        id: dashboardPost.createdById ?? null,
        name: authorName,
        email: authorEmail,
      },
    };
  }

  const staticPost = getBlogPostBySlug(slug);
  if (!staticPost) return null;
  return {
    slug,
    title: staticPost.title,
    dateIso: staticPost.dateIso,
    category: staticPost.category,
    contentHtml: paragraphsToHtml(staticPost.content),
    thumbnail: staticPost.coverImage || null,
    author: {
      id: null,
      name: "KMC Editorial Team",
      email: null,
    },
  };
}
