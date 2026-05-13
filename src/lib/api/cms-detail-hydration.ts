import { apiFetch } from "@/lib/api/client";
import {
  toCmsTextDetailSource,
  type CmsTextDetailSource,
} from "@/lib/cms/cms-detail-locale-source";
import type { ActivityNewsItem } from "@/data/activity-news";
import type { StudentNewsPost } from "@/data/student-news";
import type { PaginatedResponse } from "@/lib/content/types";
import { CMS_LIST_QUICK_PREVIEW_CAP } from "@/lib/content/constants";
import type { Lang } from "@/lib/i18n/lang";

/** Flattened CMS strings for the requested language (from `getActivityItem` / `getBlogPost`). */
export type CmsDetailMainText = {
  title: string;
  category: string;
  description: string;
};

function activityItemToSource(item: ActivityNewsItem, lang: Lang): CmsTextDetailSource {
  return toCmsTextDetailSource({
    id: item.id,
    slug: item.slug,
    imageSrc: item.imageSrc,
    dateIso: item.dateIso,
    date: item.date,
    title: item.title,
    category: item.category,
    body: item.content,
    localeContent: item.localeContent ?? null,
    resolvedForLang: lang,
  });
}

function studentPostToSource(post: StudentNewsPost, lang: Lang): CmsTextDetailSource {
  return toCmsTextDetailSource({
    id: post.id,
    slug: post.slug,
    imageSrc: post.coverImage,
    dateIso: post.dateIso,
    date: post.date,
    title: post.title,
    category: post.category,
    body: post.content,
    localeContent: post.localeContent ?? null,
    resolvedForLang: lang,
  });
}

/**
 * Re-loads CMS detail + sidebar from JSON routes so nested `localeContent` is never
 * lost to RSC → client serialization; client `pickLocalizedFields` can follow UI language.
 */
export async function hydrateActivityArticleDetail(
  slug: string,
  lang: Lang,
): Promise<{
  source: CmsTextDetailSource;
  sidebarCards: CmsTextDetailSource[];
  mainText: CmsDetailMainText;
} | null> {
  const langQ = encodeURIComponent(lang);
  try {
    const [detailRes, listRes] = await Promise.all([
      fetch(`/api/activity/${encodeURIComponent(slug)}?lang=${langQ}`, {
        cache: "no-store",
        credentials: "same-origin",
      }),
      fetch(`/api/activity?page=1&limit=${CMS_LIST_QUICK_PREVIEW_CAP}&lang=${langQ}`, {
        cache: "no-store",
        credentials: "same-origin",
      }),
    ]);
    if (!detailRes.ok) return null;
    const item = (await detailRes.json()) as ActivityNewsItem;
    const source = activityItemToSource(item, lang);
    const mainText: CmsDetailMainText = {
      title: item.title,
      category: item.category,
      description: item.content,
    };
    if (!listRes.ok) {
      return { source, sidebarCards: [], mainText };
    }
    const data = (await listRes.json()) as PaginatedResponse<ActivityNewsItem>;
    const sidebarCards = data.items
      .filter((e) => e.slug !== slug)
      .slice(0, 5)
      .map((e) => activityItemToSource(e, lang));
    return { source, sidebarCards, mainText };
  } catch {
    return null;
  }
}

export async function hydrateStudentBlogArticleDetail(
  slug: string,
  lang: Lang,
): Promise<{
  source: CmsTextDetailSource;
  sidebarCards: CmsTextDetailSource[];
  mainText: CmsDetailMainText;
} | null> {
  const langQ = encodeURIComponent(lang);
  try {
    const [detailRes, listRes] = await Promise.all([
      fetch(`/api/blog/${encodeURIComponent(slug)}?lang=${langQ}`, {
        cache: "no-store",
        credentials: "same-origin",
      }),
      fetch(`/api/blog?page=1&limit=${CMS_LIST_QUICK_PREVIEW_CAP}&lang=${langQ}`, {
        cache: "no-store",
        credentials: "same-origin",
      }),
    ]);
    if (!detailRes.ok) return null;
    const post = (await detailRes.json()) as StudentNewsPost;
    const source = studentPostToSource(post, lang);
    const mainText: CmsDetailMainText = {
      title: post.title,
      category: post.category,
      description: post.content,
    };
    if (!listRes.ok) {
      return { source, sidebarCards: [], mainText };
    }
    const data = (await listRes.json()) as PaginatedResponse<StudentNewsPost>;
    const sidebarCards = data.items
      .filter((p) => p.slug !== slug)
      .slice(0, 5)
      .map((p) => studentPostToSource(p, lang));
    return { source, sidebarCards, mainText };
  } catch {
    return null;
  }
}

export type PublicBlogHydrationPayload = {
  source: CmsTextDetailSource;
  dateLabel: string;
  showHeroImage: boolean;
  authorName: string;
};

export async function hydratePublicBlogArticleDetail(
  slug: string,
): Promise<PublicBlogHydrationPayload | null> {
  try {
    const res = await apiFetch(`/api/public/blogs/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicBlogHydrationPayload;
  } catch {
    return null;
  }
}
