import { ACTIVITY_NEWS, type ActivityNewsItem, getActivityBySlug } from "@/data/activity-news";
import { PHOTO_GALLERY_ITEMS, type PhotoGalleryItem, VIDEO_GALLERY_ITEMS, type VideoGalleryItem } from "@/data/gallery-media";
import { STUDENT_NEWS_POSTS, type StudentNewsPost, getBlogPostBySlug } from "@/data/student-news";
import {
  getPublishedDashboardActivityBySlug,
  getPublishedDashboardBlogBySlug,
} from "@/lib/dashboard/store";
import type {
  CategoryOption,
  ContentListQuery,
  PaginatedResponse,
  YearOption,
} from "@/lib/content/types";
import {
  canonicalCategory,
  legacyLocaleMapFromFlat,
  parseLocaleContentMap,
  pickLocalizedFields,
} from "@/lib/i18n/content-locale";
import type { Lang } from "@/lib/i18n/lang";
import { getRequestLang } from "@/lib/i18n/server-language";
import { CMS_LIST_QUICK_PREVIEW_CAP } from "@/lib/content/constants";
import { prisma } from "@/lib/prisma";
import { clampPage, totalPagesFromCount } from "@/lib/pagination/get-pagination-items";

type DashboardContentModelDelegate = {
  findMany(args: unknown): Promise<PrismaContentDoc[]>;
};

type DashboardPrismaClient = typeof prisma & {
  dashboardBlog: DashboardContentModelDelegate;
  dashboardActivity: DashboardContentModelDelegate;
  dashboardPhoto: DashboardContentModelDelegate;
  dashboardVideo: DashboardContentModelDelegate;
};

const dashboardPrisma = prisma as DashboardPrismaClient;

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
  const y = Number.parseInt(dateIso.slice(0, 4), 10);
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

type PrismaContentDoc = {
  id: string;
  title: string;
  category: string;
  createdAt: Date;
  description: string | null;
  coverImage: string | null;
  videoUrl: string | null;
  slug: string | null;
  localeContent: unknown;
};

function resolveLocaleMap(row: PrismaContentDoc) {
  return (
    parseLocaleContentMap(row.localeContent) ??
    legacyLocaleMapFromFlat(row.title, row.category, row.description ?? "")
  );
}

function resolveContentSlug(row: PrismaContentDoc, map: ReturnType<typeof resolveLocaleMap>): string {
  if (row.slug?.trim()) return row.slug.trim();
  return slugify(map.en.title) || slugify(map.ko.title) || slugify(map.bn.title) || row.id;
}

type ListPublishedOpts = {
  /** When set, only the newest N rows are read from the DB (plus a small buffer for videos with empty URLs). */
  take?: number;
};

async function listPublishedContentByType(
  type: "blog" | "activity" | "photo" | "video",
  options?: ListPublishedOpts,
): Promise<PrismaContentDoc[] | null> {
  const where = { OR: [{ status: "published" as const }, { status: null }] };
  const take = options?.take;
  try {
    switch (type) {
      case "blog":
        return await dashboardPrisma.dashboardBlog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          ...(take != null ? { take } : {}),
        });
      case "activity":
        return await dashboardPrisma.dashboardActivity.findMany({
          where,
          orderBy: { createdAt: "desc" },
          ...(take != null ? { take } : {}),
        });
      case "photo":
        return await dashboardPrisma.dashboardPhoto.findMany({
          where,
          orderBy: { createdAt: "desc" },
          ...(take != null ? { take } : {}),
        });
      case "video": {
        const buffer =
          take != null ? Math.min(Math.max(take * 6, take + 8), 400) : undefined;
        const rows = await dashboardPrisma.dashboardVideo.findMany({
          where,
          orderBy: { createdAt: "desc" },
          ...(buffer != null ? { take: buffer } : {}),
        });
        const withUrl = rows.filter((row: PrismaContentDoc) =>
          !!row.videoUrl?.trim(),
        );
        if (take != null) {
          return withUrl.slice(0, take);
        }
        return withUrl;
      }
    }
  } catch {
    return null;
  }
}

function mapDbBlogPost(row: PrismaContentDoc, lang: Lang): StudentNewsPost {
  const map = resolveLocaleMap(row);
  const loc = pickLocalizedFields(map, lang);
  const dateIso = row.createdAt.toISOString();
  const plain = stripHtml(loc.description);
  const slug = resolveContentSlug(row, map);
  return {
    id: row.id,
    locale: lang,
    slug,
    dateIso,
    date: formatHumanDate(dateIso),
    category: canonicalCategory(map),
    title: loc.title,
    excerpt: plain.slice(0, 180) || loc.title,
    coverImage: row.coverImage || "/brand/logo.png",
    content: loc.description,
    localeContent: map,
  };
}

function mapDbActivityItem(row: PrismaContentDoc, lang: Lang): ActivityNewsItem {
  const map = resolveLocaleMap(row);
  const loc = pickLocalizedFields(map, lang);
  const dateIso = row.createdAt.toISOString();
  const plain = stripHtml(loc.description);
  const slug = resolveContentSlug(row, map);
  return {
    id: row.id,
    locale: lang,
    slug,
    dateIso,
    date: formatHumanDate(dateIso),
    category: canonicalCategory(map),
    title: loc.title,
    excerpt: plain.slice(0, 180) || loc.title,
    imageSrc: row.coverImage || "/brand/logo.png",
    content: loc.description,
    localeContent: map,
  };
}

function mapDbPhotoItem(row: PrismaContentDoc, lang: Lang): PhotoGalleryItem {
  const map = resolveLocaleMap(row);
  const loc = pickLocalizedFields(map, lang);
  return {
    id: row.id,
    category: canonicalCategory(map),
    title: loc.title,
    caption: loc.title,
    imageSrc: row.coverImage || "/brand/logo.png",
    gridClass: "md:col-span-4",
    minHClass: "min-h-[220px]",
    dateIso: row.createdAt.toISOString(),
    localeContent: map,
  };
}

function mapDbVideoItem(row: PrismaContentDoc, lang: Lang): VideoGalleryItem {
  const map = resolveLocaleMap(row);
  const loc = pickLocalizedFields(map, lang);
  return {
    id: row.id,
    category: canonicalCategory(map),
    title: loc.title,
    thumbClass: "from-[#2c7bb6] to-sky-400",
    embedUrl: row.videoUrl || "",
    dateIso: row.createdAt.toISOString(),
    localeContent: map,
  };
}

function mapStaticBlog(post: StudentNewsPost, lang: Lang): StudentNewsPost {
  return { ...post, locale: lang };
}

function mapStaticActivity(item: ActivityNewsItem, lang: Lang): ActivityNewsItem {
  return { ...item, locale: lang };
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

function paginate<T>(items: T[], query: ContentListQuery): {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
} {
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

export type ListContentRepositoryOpts = {
  maxRowsFromDb?: number;
};

/** When listing query is page 1 with no filters, cap DB reads to `pageSize` (pagination beyond page 1 needs a full scan). */
export function repositoryOptsForListQuery(
  query: ContentListQuery,
): ListContentRepositoryOpts | undefined {
  const page = query.page ?? 1;
  const ps = query.pageSize;
  if (page !== 1 || query.category || query.year != null || ps == null) {
    return undefined;
  }
  return { maxRowsFromDb: ps };
}

export async function listBlogPosts(
  query: ContentListQuery,
  /** When set (e.g. from `?lang=` on API), avoids relying on cookie timing alone. */
  lang?: Lang,
  opts?: ListContentRepositoryOpts,
): Promise<PaginatedResponse<StudentNewsPost>> {
  const requestLang = lang ?? (await getRequestLang());
  const dbTake = opts?.maxRowsFromDb;
  const dbRows = await listPublishedContentByType(
    "blog",
    dbTake != null ? { take: dbTake } : undefined,
  );
  const staticSorted = [...STUDENT_NEWS_POSTS].sort((a, b) =>
    b.dateIso.localeCompare(a.dateIso),
  );
  const staticSlice =
    dbTake != null ? staticSorted.slice(0, dbTake) : staticSorted;
  const base = dbRows
    ? dbRows.map((row) => mapDbBlogPost(row, requestLang))
    : staticSlice.map((p) => mapStaticBlog(p, requestLang));
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

export async function getBlogPost(slug: string, lang?: Lang): Promise<StudentNewsPost | null> {
  const requestLang = lang ?? (await getRequestLang());
  const row = await getPublishedDashboardBlogBySlug(slug);
  if (row) {
    return mapDbBlogPost(
      {
        id: row.id,
        title: row.title,
        category: row.category,
        createdAt: new Date(row.dateIso),
        description: row.description ?? null,
        coverImage: row.coverImage ?? null,
        videoUrl: row.videoUrl ?? null,
        slug: row.slug,
        localeContent: row.localeContent,
      },
      requestLang,
    );
  }
  const staticMatch = getBlogPostBySlug(slug) ?? null;
  if (!staticMatch) return null;
  return mapStaticBlog(staticMatch, requestLang);
}

export async function listActivityItems(
  query: ContentListQuery,
  lang?: Lang,
  opts?: ListContentRepositoryOpts,
): Promise<PaginatedResponse<ActivityNewsItem>> {
  const requestLang = lang ?? (await getRequestLang());
  const dbTake = opts?.maxRowsFromDb;
  const dbRows = await listPublishedContentByType(
    "activity",
    dbTake != null ? { take: dbTake } : undefined,
  );
  const staticSorted = [...ACTIVITY_NEWS].sort((a, b) =>
    (b.dateIso ?? "").localeCompare(a.dateIso ?? ""),
  );
  const staticSlice =
    dbTake != null ? staticSorted.slice(0, dbTake) : staticSorted;
  const base = dbRows
    ? dbRows.map((row) => mapDbActivityItem(row, requestLang))
    : staticSlice.map((item) => mapStaticActivity(item, requestLang));
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

export async function getActivityItem(slug: string, lang?: Lang): Promise<ActivityNewsItem | null> {
  const requestLang = lang ?? (await getRequestLang());
  const row = await getPublishedDashboardActivityBySlug(slug);
  if (row) {
    return mapDbActivityItem(
      {
        id: row.id,
        title: row.title,
        category: row.category,
        createdAt: new Date(row.dateIso),
        description: row.description ?? null,
        coverImage: row.coverImage ?? null,
        videoUrl: row.videoUrl ?? null,
        slug: row.slug,
        localeContent: row.localeContent,
      },
      requestLang,
    );
  }
  const staticMatch = getActivityBySlug(slug) ?? null;
  if (!staticMatch) return null;
  return mapStaticActivity(staticMatch, requestLang);
}

export async function listPhotoItems(
  query: ContentListQuery,
  lang?: Lang,
  opts?: ListContentRepositoryOpts,
): Promise<PaginatedResponse<PhotoGalleryItem>> {
  const requestLang = lang ?? (await getRequestLang());
  const dbTake = opts?.maxRowsFromDb;
  const dbRows = await listPublishedContentByType(
    "photo",
    dbTake != null ? { take: dbTake } : undefined,
  );
  const staticSorted = [...PHOTO_GALLERY_ITEMS].sort((a, b) =>
    b.dateIso.localeCompare(a.dateIso),
  );
  const staticSlice =
    dbTake != null ? staticSorted.slice(0, dbTake) : staticSorted;
  const base = dbRows
    ? dbRows.map((row) => mapDbPhotoItem(row, requestLang))
    : staticSlice;
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
  lang?: Lang,
  opts?: ListContentRepositoryOpts,
): Promise<PaginatedResponse<VideoGalleryItem>> {
  const requestLang = lang ?? (await getRequestLang());
  const dbTake = opts?.maxRowsFromDb;
  const dbRows = await listPublishedContentByType(
    "video",
    dbTake != null ? { take: dbTake } : undefined,
  );
  const staticSorted = [...VIDEO_GALLERY_ITEMS].sort((a, b) =>
    b.dateIso.localeCompare(a.dateIso),
  );
  const staticSlice =
    dbTake != null ? staticSorted.slice(0, dbTake) : staticSorted;
  const base = dbRows
    ? dbRows
        .filter((row) => !!row.videoUrl?.trim())
        .map((row) => mapDbVideoItem(row, requestLang))
    : staticSlice;
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
