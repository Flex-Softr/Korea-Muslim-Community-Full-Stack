import { prisma } from "@/lib/prisma";
import { getPublishedDashboardBlogBySlug } from "@/lib/dashboard/store";
import { getBlogPostBySlug } from "@/data/student-news";
import { pickLocalizedFields, type LocaleContentMap } from "@/lib/i18n/content-locale";
import { getRequestLang } from "@/lib/i18n/server-language";

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
  /** Dashboard-backed posts only — enables live language switching on the article page. */
  localeContent?: LocaleContentMap | null;
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
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<script[\s\S]*?\/>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, "");
}

function sanitizeLocaleDescriptions(map: LocaleContentMap): LocaleContentMap {
  return {
    en: { ...map.en, description: sanitizeHtml(map.en.description) },
    ko: { ...map.ko, description: sanitizeHtml(map.ko.description) },
    bn: { ...map.bn, description: sanitizeHtml(map.bn.description) },
  };
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
    const loc = pickLocalizedFields(dashboardPost.localeContent, requestLang);
    return {
      slug: dashboardPost.slug,
      title: loc.title,
      dateIso: dashboardPost.dateIso,
      category: loc.category,
      contentHtml: sanitizeHtml(loc.description || "<p></p>"),
      thumbnail: dashboardPost.coverImage || null,
      author: {
        id: dashboardPost.createdById ?? null,
        name: authorName,
        email: authorEmail,
      },
      localeContent: sanitizeLocaleDescriptions(dashboardPost.localeContent),
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
