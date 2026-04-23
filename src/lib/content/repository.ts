import { ACTIVITY_NEWS, type ActivityNewsItem, getActivityBySlug } from "@/data/activity-news";
import { PHOTO_GALLERY_ITEMS, type PhotoGalleryItem, VIDEO_GALLERY_ITEMS, type VideoGalleryItem } from "@/data/gallery-media";
import { STUDENT_NEWS_POSTS, type StudentNewsPost, getBlogPostBySlug } from "@/data/student-news";
import type {
  CategoryOption,
  ContentListQuery,
  PaginatedResponse,
  YearOption,
} from "@/lib/content/types";
import { getRequestLang } from "@/lib/i18n/server-language";
import { prisma } from "@/lib/prisma";
import { clampPage, totalPagesFromCount } from "@/lib/pagination/get-pagination-items";
import { translateText } from "@/lib/translate";

function categoryOptionsFrom<T extends { category: string }>(
  items: T[],
): CategoryOption[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([id, count]) => ({ id, label: id, count }));
}

function yearFromIso(dateIso?: string): number | null {
  if (!dateIso) return null;
  const y = Number(dateIso.slice(0, 4));
  return Number.isFinite(y) ? y : null;
}

function yearOptionsFrom<T extends { dateIso?: string }>(items: T[]): YearOption[] {
  const counts = new Map<number, number>();
  for (const item of items) {
    const y = yearFromIso(item.dateIso);
    if (y == null) continue;
    counts.set(y, (counts.get(y) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([value, count]) => ({ value, count }));
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatHumanDate(dateIso: string): string {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return dateIso;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

type DashboardContentRow = {
  id: string;
  title: string;
  category: string;
  createdAt: Date;
  description: string | null;
  coverImage: string | null;
  videoUrl: string | null;
};

async function listPublishedContentByType(type: "blog" | "activity" | "photo" | "video"): Promise<DashboardContentRow[] | null> {
  const delegate = (prisma as unknown as {
    dashboardContent?: {
      findMany: (args: unknown) => Promise<DashboardContentRow[]>;
    };
  }).dashboardContent;
  if (!delegate?.findMany) return null;
  try {
    return await delegate.findMany({
      where: {
        type,
        OR: [{ status: "published" }, { status: null }],
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return null;
  }
}

function mapDbBlogPost(row: {
  id: string;
  title: string;
  category: string;
  createdAt: Date;
  description: string | null;
  coverImage: string | null;
}): StudentNewsPost {
  const dateIso = row.createdAt.toISOString();
  const plain = stripHtml(row.description ?? "");
  return {
    id: row.id,
    locale: "en",
    slug: slugify(row.title),
    dateIso,
    date: formatHumanDate(dateIso),
    category: row.category || "General",
    title: row.title,
    excerpt: plain.slice(0, 180) || row.title,
    coverImage: row.coverImage || "/brand/logo.png",
    content: row.description || "",
  };
}

function mapDbActivityItem(row: {
  id: string;
  title: string;
  category: string;
  createdAt: Date;
  description: string | null;
  coverImage: string | null;
}): ActivityNewsItem {
  const dateIso = row.createdAt.toISOString();
  const plain = stripHtml(row.description ?? "");
  return {
    id: row.id,
    locale: "en",
    slug: slugify(row.title),
    dateIso,
    date: formatHumanDate(dateIso),
    category: row.category || "General",
    title: row.title,
    excerpt: plain.slice(0, 180) || row.title,
    imageSrc: row.coverImage || "/brand/logo.png",
    content: row.description || "",
  };
}

function mapDbPhotoItem(row: {
  id: string;
  title: string;
  category: string;
  createdAt: Date;
  coverImage: string | null;
}): PhotoGalleryItem {
  return {
    id: row.id,
    category: row.category || "General",
    title: row.title,
    caption: row.title,
    imageSrc: row.coverImage || "/brand/logo.png",
    gridClass: "md:col-span-4",
    minHClass: "min-h-[220px]",
    dateIso: row.createdAt.toISOString(),
  };
}

function mapDbVideoItem(row: {
  id: string;
  title: string;
  category: string;
  createdAt: Date;
  videoUrl: string | null;
}): VideoGalleryItem {
  return {
    id: row.id,
    category: row.category || "General",
    title: row.title,
    thumbClass: "from-[#2c7bb6] to-sky-400",
    embedUrl: row.videoUrl || "",
    dateIso: row.createdAt.toISOString(),
  };
}

function applyFilters<T extends { category: string; dateIso?: string }>(
  items: T[],
  query: ContentListQuery,
): T[] {
  return items.filter((item) => {
    if (query.category && item.category !== query.category) return false;
    if (query.year != null) {
      const y = yearFromIso(item.dateIso);
      if (y !== query.year) return false;
    }
    return true;
  });
}

function paginate<T>(items: T[], query: ContentListQuery): { items: T[]; page: number; pageSize: number; totalItems: number; totalPages: number } {
  const pageSize = Math.max(1, Math.floor(query.pageSize ?? 9));
  const totalItems = items.length;
  const totalPages = totalPagesFromCount(totalItems, pageSize);
  const page = clampPage(query.page ?? 1, totalPages);
  const offset = (page - 1) * pageSize;
  return {
    items: items.slice(offset, offset + pageSize),
    page,
    pageSize,
    totalItems,
    totalPages,
  };
}

async function translateBlogPost(
  post: StudentNewsPost,
  lang: "en" | "bn" | "kr",
): Promise<StudentNewsPost> {
  const source = post.locale ?? "en";
  if (source === lang) return post;
  const [title, excerpt, content, category] = await Promise.all([
    translateText(post.title, lang, source),
    translateText(post.excerpt, lang, source),
    translateText(post.content, lang, source),
    translateText(post.category, lang, source),
  ]);
  return { ...post, title, excerpt, content, category };
}

async function translateActivityItem(
  item: ActivityNewsItem,
  lang: "en" | "bn" | "kr",
): Promise<ActivityNewsItem> {
  const source = item.locale ?? "en";
  if (source === lang) return item;
  const [title, excerpt, content, category] = await Promise.all([
    translateText(item.title, lang, source),
    translateText(item.excerpt, lang, source),
    translateText(item.content, lang, source),
    translateText(item.category, lang, source),
  ]);
  return { ...item, title, excerpt, content, category };
}

export async function listBlogPosts(
  query: ContentListQuery,
): Promise<PaginatedResponse<StudentNewsPost>> {
  const requestLang = await getRequestLang();
  const dbRows = await listPublishedContentByType("blog");
  const base = dbRows
    ? dbRows.map(mapDbBlogPost)
    : [...STUDENT_NEWS_POSTS].sort((a, b) => b.dateIso.localeCompare(a.dateIso));
  const filtered = applyFilters(base, query);
  const paged = paginate(filtered, query);
  const translatedItems = await Promise.all(
    paged.items.map((item) => translateBlogPost(item, requestLang)),
  );
  const translatedCategories = await Promise.all(
    categoryOptionsFrom(base).map(async (category) => ({
      ...category,
      label: await translateText(category.label, requestLang, "en"),
    })),
  );
  return {
    items: translatedItems,
    categories: translatedCategories,
    years: yearOptionsFrom(base),
    pagination: {
      page: paged.page,
      pageSize: paged.pageSize,
      totalItems: paged.totalItems,
      totalPages: paged.totalPages,
    },
  };
}

export async function getBlogPost(slug: string): Promise<StudentNewsPost | null> {
  const requestLang = await getRequestLang();
  const dbRows = await listPublishedContentByType("blog");
  if (dbRows) {
    const dbMatch = dbRows
      .map(mapDbBlogPost)
      .find((post) => post.slug === slug);
    if (dbMatch) return translateBlogPost(dbMatch, requestLang);
  }
  const staticMatch = getBlogPostBySlug(slug) ?? null;
  if (!staticMatch) return null;
  return translateBlogPost(staticMatch, requestLang);
}

export async function listActivityItems(
  query: ContentListQuery,
): Promise<PaginatedResponse<ActivityNewsItem>> {
  const requestLang = await getRequestLang();
  const dbRows = await listPublishedContentByType("activity");
  const base = dbRows
    ? dbRows.map(mapDbActivityItem)
    : [...ACTIVITY_NEWS].sort((a, b) => (b.dateIso ?? "").localeCompare(a.dateIso ?? ""));
  const filtered = applyFilters(base, query);
  const paged = paginate(filtered, query);
  const translatedItems = await Promise.all(
    paged.items.map((item) => translateActivityItem(item, requestLang)),
  );
  const translatedCategories = await Promise.all(
    categoryOptionsFrom(base).map(async (category) => ({
      ...category,
      label: await translateText(category.label, requestLang, "en"),
    })),
  );
  return {
    items: translatedItems,
    categories: translatedCategories,
    years: yearOptionsFrom(base),
    pagination: {
      page: paged.page,
      pageSize: paged.pageSize,
      totalItems: paged.totalItems,
      totalPages: paged.totalPages,
    },
  };
}

export async function getActivityItem(
  slug: string,
): Promise<ActivityNewsItem | null> {
  const requestLang = await getRequestLang();
  const dbRows = await listPublishedContentByType("activity");
  if (dbRows) {
    const dbMatch = dbRows
      .map(mapDbActivityItem)
      .find((item) => item.slug === slug);
    if (dbMatch) return translateActivityItem(dbMatch, requestLang);
  }
  const staticMatch = getActivityBySlug(slug) ?? null;
  if (!staticMatch) return null;
  return translateActivityItem(staticMatch, requestLang);
}

export async function listPhotoItems(
  query: ContentListQuery,
): Promise<PaginatedResponse<PhotoGalleryItem>> {
  const dbRows = await listPublishedContentByType("photo");
  const base = dbRows
    ? dbRows.map(mapDbPhotoItem)
    : [...PHOTO_GALLERY_ITEMS].sort((a, b) => b.dateIso.localeCompare(a.dateIso));
  const filtered = applyFilters(base, query);
  const paged = paginate(filtered, query);
  return {
    items: paged.items,
    categories: categoryOptionsFrom(base),
    years: yearOptionsFrom(base),
    pagination: {
      page: paged.page,
      pageSize: paged.pageSize,
      totalItems: paged.totalItems,
      totalPages: paged.totalPages,
    },
  };
}

export async function listVideoItems(
  query: ContentListQuery,
): Promise<PaginatedResponse<VideoGalleryItem>> {
  const dbRows = await listPublishedContentByType("video");
  const base = dbRows
    ? dbRows
        .filter((row) => !!row.videoUrl?.trim())
        .map(mapDbVideoItem)
    : [...VIDEO_GALLERY_ITEMS].sort((a, b) => b.dateIso.localeCompare(a.dateIso));
  const filtered = applyFilters(base, query);
  const paged = paginate(filtered, query);
  return {
    items: paged.items,
    categories: categoryOptionsFrom(base),
    years: yearOptionsFrom(base),
    pagination: {
      page: paged.page,
      pageSize: paged.pageSize,
      totalItems: paged.totalItems,
      totalPages: paged.totalPages,
    },
  };
}
