import { prisma } from "@/lib/prisma";
import { getPublishedDashboardBlogBySlug } from "@/lib/dashboard/store";
import { getBlogPostBySlug } from "@/data/student-news";
import { getRequestLang } from "@/lib/i18n/server-language";
import { translateText } from "@/lib/translate";

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
  const requestLang = await getRequestLang();
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
    const [title, category, contentHtml] = await Promise.all([
      translateText(dashboardPost.title, requestLang, "en"),
      translateText(dashboardPost.category, requestLang, "en"),
      translateText(dashboardPost.description || "<p></p>", requestLang, "en"),
    ]);
    return {
      slug,
      title,
      dateIso: dashboardPost.dateIso,
      category,
      contentHtml: sanitizeHtml(contentHtml),
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
  const [title, category, content] = await Promise.all([
    translateText(staticPost.title, requestLang, staticPost.locale ?? "en"),
    translateText(staticPost.category, requestLang, staticPost.locale ?? "en"),
    translateText(staticPost.content, requestLang, staticPost.locale ?? "en"),
  ]);
  return {
    slug,
    title,
    dateIso: staticPost.dateIso,
    category,
    contentHtml: paragraphsToHtml(content),
    thumbnail: staticPost.coverImage || null,
    author: {
      id: null,
      name: "KMC Editorial Team",
      email: null,
    },
  };
}
