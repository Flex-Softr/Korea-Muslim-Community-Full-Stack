import { ACTIVITY_NEWS, type ActivityNewsItem, getActivityBySlug } from "@/data/activity-news";
import { PHOTO_GALLERY_ITEMS, type PhotoGalleryItem, VIDEO_GALLERY_ITEMS, type VideoGalleryItem } from "@/data/gallery-media";
import { STUDENT_NEWS_POSTS, type StudentNewsPost, getBlogPostBySlug } from "@/data/student-news";
import { cacheLife, cacheTag } from "next/cache";
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
import { prisma } from "@/lib/prisma";
import { clampPage, offsetForPage, totalPagesFromCount } from "@/lib/pagination/get-pagination-items";

type CmsModelDelegate = {
  count(args: unknown): Promise<number>;
  findMany(args: unknown): Promise<unknown[]>;
  groupBy(args: unknown): Promise<{ category: string; _count: { _all: number } }[]>;
};

type DashboardPrismaClient = typeof prisma & {
  dashboardBlog: CmsModelDelegate;
  dashboardActivity: CmsModelDelegate;
  dashboardPhoto: CmsModelDelegate;
  dashboardVideo: CmsModelDelegate;
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

const PUBLISHED_OR_LEGACY = {
  OR: [{ status: "published" as const }, { status: null }],
} as const;

const LIST_DOC_SELECT = {
  id: true,
  title: true,
  category: true,
  createdAt: true,
  description: true,
  coverImage: true,
  videoUrl: true,
  slug: true,
  localeContent: true,
} as const;

const FACET_YEAR_SAMPLE = 4000;

function buildCategoryYearWhereBlog(query: ContentListQuery): object {
  const and: object[] = [PUBLISHED_OR_LEGACY];
  const cat = query.category?.trim();
  if (cat) {
    and.push({ category: cat });
  }
  if (query.year != null && Number.isFinite(query.year)) {
    const y = query.year;
    and.push({
      createdAt: {
        gte: new Date(Date.UTC(y, 0, 1)),
        lt: new Date(Date.UTC(y + 1, 0, 1)),
      },
    });
  }
  return { AND: and };
}

function buildCategoryYearWhereActivity(query: ContentListQuery): object {
  const and: object[] = [{ OR: [{ status: "published" as const }, { status: null }] }];
  const cat = query.category?.trim();
  if (cat) {
    and.push({ category: cat });
  }
  if (query.year != null && Number.isFinite(query.year)) {
    const y = query.year;
    and.push({
      createdAt: {
        gte: new Date(Date.UTC(y, 0, 1)),
        lt: new Date(Date.UTC(y + 1, 0, 1)),
      },
    });
  }
  return { AND: and };
}

function buildCategoryYearWherePhoto(query: ContentListQuery): object {
  const and: object[] = [{ OR: [{ status: "published" as const }, { status: null }] }];
  const cat = query.category?.trim();
  if (cat) {
    and.push({ category: cat });
  }
  if (query.year != null && Number.isFinite(query.year)) {
    const y = query.year;
    and.push({
      createdAt: {
        gte: new Date(Date.UTC(y, 0, 1)),
        lt: new Date(Date.UTC(y + 1, 0, 1)),
      },
    });
  }
  return { AND: and };
}

/** Embeddable URLs only so `count` / `skip` match listable items (avoids full scans trimming empty URLs). */
function buildVideoListWhere(query: ContentListQuery): object {
  const and: object[] = [
    { OR: [{ status: "published" as const }, { status: null }] },
    {
      OR: [
        { videoUrl: { startsWith: "http://" } },
        { videoUrl: { startsWith: "https://" } },
        { videoUrl: { startsWith: "//" } },
      ],
    },
  ];
  const cat = query.category?.trim();
  if (cat) {
    and.push({ category: cat });
  }
  if (query.year != null && Number.isFinite(query.year)) {
    const y = query.year;
    and.push({
      createdAt: {
        gte: new Date(Date.UTC(y, 0, 1)),
        lt: new Date(Date.UTC(y + 1, 0, 1)),
      },
    });
  }
  return { AND: and };
}

function listPaginationPlan(totalDb: number, query: ContentListQuery, maxCap?: number) {
  const pageSize = Math.max(1, Math.floor(query.pageSize ?? 9));
  const effectiveTotal = maxCap != null ? Math.min(totalDb, maxCap) : totalDb;
  const totalPages = totalPagesFromCount(effectiveTotal, pageSize);
  const page = clampPage(query.page ?? 1, totalPages);
  const skip = offsetForPage(page, pageSize);
  let take = pageSize;
  if (maxCap != null) {
    take = Math.max(0, Math.min(pageSize, maxCap - skip));
  }
  return { pageSize, effectiveTotal, totalPages, page, skip, take };
}

function logDbListError(label: string, err: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[content/repository] ${label}:`, err);
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
  /** When set, caps how many newest published rows participate in totals and pagination (previews / home). */
  maxRowsFromDb?: number;
  /** Listing facets are expensive and unnecessary for small preview sections. */
  withFacets?: boolean;
};

/** Optional hint for callers that only need the first page without filters (same as passing `maxRowsFromDb: pageSize`). */
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

async function facetCategoriesAndYearsBlog(): Promise<{
  categories: CategoryOption[];
  years: YearOption[];
}> {
  const [categoryGroups, yearSamples] = await Promise.all([
    dashboardPrisma.dashboardBlog.groupBy({
      by: ["category"],
      where: PUBLISHED_OR_LEGACY,
      _count: { _all: true },
    }),
    dashboardPrisma.dashboardBlog.findMany({
      where: PUBLISHED_OR_LEGACY,
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
      take: FACET_YEAR_SAMPLE,
    }),
  ]);
  const categories: CategoryOption[] = [...categoryGroups]
    .sort((a, b) => a.category.localeCompare(b.category))
    .map((g) => ({
      id: g.category,
      label: g.category,
      count: g._count._all,
    }));
  const years = yearOptionsFrom(
    (yearSamples as { createdAt: Date }[]).map((r) => ({ dateIso: r.createdAt.toISOString() })),
  );
  return { categories, years };
}

async function facetCategoriesAndYearsActivity(): Promise<{
  categories: CategoryOption[];
  years: YearOption[];
}> {
  const [categoryGroups, yearSamples] = await Promise.all([
    dashboardPrisma.dashboardActivity.groupBy({
      by: ["category"],
      where: PUBLISHED_OR_LEGACY,
      _count: { _all: true },
    }),
    dashboardPrisma.dashboardActivity.findMany({
      where: PUBLISHED_OR_LEGACY,
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
      take: FACET_YEAR_SAMPLE,
    }),
  ]);
  const categories: CategoryOption[] = [...categoryGroups]
    .sort((a, b) => a.category.localeCompare(b.category))
    .map((g) => ({
      id: g.category,
      label: g.category,
      count: g._count._all,
    }));
  const years = yearOptionsFrom(
    (yearSamples as { createdAt: Date }[]).map((r) => ({ dateIso: r.createdAt.toISOString() })),
  );
  return { categories, years };
}

async function facetCategoriesAndYearsPhoto(): Promise<{
  categories: CategoryOption[];
  years: YearOption[];
}> {
  const [categoryGroups, yearSamples] = await Promise.all([
    dashboardPrisma.dashboardPhoto.groupBy({
      by: ["category"],
      where: PUBLISHED_OR_LEGACY,
      _count: { _all: true },
    }),
    dashboardPrisma.dashboardPhoto.findMany({
      where: PUBLISHED_OR_LEGACY,
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
      take: FACET_YEAR_SAMPLE,
    }),
  ]);
  const categories: CategoryOption[] = [...categoryGroups]
    .sort((a, b) => a.category.localeCompare(b.category))
    .map((g) => ({
      id: g.category,
      label: g.category,
      count: g._count._all,
    }));
  const years = yearOptionsFrom(
    (yearSamples as { createdAt: Date }[]).map((r) => ({ dateIso: r.createdAt.toISOString() })),
  );
  return { categories, years };
}

async function facetCategoriesAndYearsVideo(): Promise<{
  categories: CategoryOption[];
  years: YearOption[];
}> {
  const baseWhere = buildVideoListWhere({});
  const [categoryGroups, yearSamples] = await Promise.all([
    dashboardPrisma.dashboardVideo.groupBy({
      by: ["category"],
      where: baseWhere,
      _count: { _all: true },
    }),
    dashboardPrisma.dashboardVideo.findMany({
      where: baseWhere,
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
      take: FACET_YEAR_SAMPLE,
    }),
  ]);
  const categories: CategoryOption[] = [...categoryGroups]
    .sort((a, b) => a.category.localeCompare(b.category))
    .map((g) => ({
      id: g.category,
      label: g.category,
      count: g._count._all,
    }));
  const years = yearOptionsFrom(
    (yearSamples as { createdAt: Date }[]).map((r) => ({ dateIso: r.createdAt.toISOString() })),
  );
  return { categories, years };
}

function listBlogPostsStatic(
  requestLang: Lang,
  query: ContentListQuery,
  opts?: ListContentRepositoryOpts,
): PaginatedResponse<StudentNewsPost> {
  const maxCap = opts?.maxRowsFromDb;
  const staticSorted = [...STUDENT_NEWS_POSTS].sort((a, b) =>
    b.dateIso.localeCompare(a.dateIso),
  );
  const staticSlice = maxCap != null ? staticSorted.slice(0, maxCap) : staticSorted;
  const base = staticSlice.map((p) => mapStaticBlog(p, requestLang));
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

async function listBlogPostsFromDb(
  requestLang: Lang,
  query: ContentListQuery,
  opts?: ListContentRepositoryOpts,
): Promise<PaginatedResponse<StudentNewsPost>> {
  const where = buildCategoryYearWhereBlog(query);
  const maxCap = opts?.maxRowsFromDb;
  const withFacets = opts?.withFacets ?? true;
  const totalDb = await dashboardPrisma.dashboardBlog.count({ where });
  const { effectiveTotal, totalPages, page, skip, take, pageSize } = listPaginationPlan(
    totalDb,
    query,
    maxCap,
  );
  const [facets, rawRows] = await Promise.all([
    withFacets
      ? facetCategoriesAndYearsBlog()
      : Promise.resolve({ categories: [] as CategoryOption[], years: [] as YearOption[] }),
    take === 0
      ? Promise.resolve([])
      : dashboardPrisma.dashboardBlog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
          select: LIST_DOC_SELECT,
        }),
  ]);
  const rows = rawRows as PrismaContentDoc[];
  const items = rows.map((row) => mapDbBlogPost(row, requestLang));
  return {
    items,
    categories: facets.categories,
    years: facets.years,
    pagination: {
      page,
      pageSize,
      totalItems: effectiveTotal,
      totalPages,
    },
  };
}

export async function listBlogPosts(
  query: ContentListQuery,
  /** When set (e.g. from `?lang=` on API), avoids relying on cookie timing alone. */
  lang?: Lang,
  opts?: ListContentRepositoryOpts,
): Promise<PaginatedResponse<StudentNewsPost>> {
  const requestLang = lang ?? (await getRequestLang());
  try {
    return await listBlogPostsFromDb(requestLang, query, opts);
  } catch (err) {
    logDbListError("listBlogPosts", err);
    return listBlogPostsStatic(requestLang, query, opts);
  }
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

function listActivityItemsStatic(
  requestLang: Lang,
  query: ContentListQuery,
  opts?: ListContentRepositoryOpts,
): PaginatedResponse<ActivityNewsItem> {
  const maxCap = opts?.maxRowsFromDb;
  const staticSorted = [...ACTIVITY_NEWS].sort((a, b) =>
    (b.dateIso ?? "").localeCompare(a.dateIso ?? ""),
  );
  const staticSlice = maxCap != null ? staticSorted.slice(0, maxCap) : staticSorted;
  const base = staticSlice.map((item) => mapStaticActivity(item, requestLang));
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

async function listActivityItemsFromDb(
  requestLang: Lang,
  query: ContentListQuery,
  opts?: ListContentRepositoryOpts,
): Promise<PaginatedResponse<ActivityNewsItem>> {
  const where = buildCategoryYearWhereActivity(query);
  const maxCap = opts?.maxRowsFromDb;
  const withFacets = opts?.withFacets ?? true;
  const totalDb = await dashboardPrisma.dashboardActivity.count({ where });
  const { effectiveTotal, totalPages, page, skip, take, pageSize } = listPaginationPlan(
    totalDb,
    query,
    maxCap,
  );
  const [facets, rawRows] = await Promise.all([
    withFacets
      ? facetCategoriesAndYearsActivity()
      : Promise.resolve({ categories: [] as CategoryOption[], years: [] as YearOption[] }),
    take === 0
      ? Promise.resolve([])
      : dashboardPrisma.dashboardActivity.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
          select: LIST_DOC_SELECT,
        }),
  ]);
  const rows = rawRows as PrismaContentDoc[];
  const items = rows.map((row) => mapDbActivityItem(row, requestLang));
  return {
    items,
    categories: facets.categories,
    years: facets.years,
    pagination: {
      page,
      pageSize,
      totalItems: effectiveTotal,
      totalPages,
    },
  };
}

export async function listActivityItems(
  query: ContentListQuery,
  lang?: Lang,
  opts?: ListContentRepositoryOpts,
): Promise<PaginatedResponse<ActivityNewsItem>> {
  const requestLang = lang ?? (await getRequestLang());
  try {
    return await listActivityItemsFromDb(requestLang, query, opts);
  } catch (err) {
    logDbListError("listActivityItems", err);
    return listActivityItemsStatic(requestLang, query, opts);
  }
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

function listPhotoItemsStatic(
  _requestLang: Lang,
  query: ContentListQuery,
  opts?: ListContentRepositoryOpts,
): PaginatedResponse<PhotoGalleryItem> {
  const maxCap = opts?.maxRowsFromDb;
  const staticSorted = [...PHOTO_GALLERY_ITEMS].sort((a, b) =>
    b.dateIso.localeCompare(a.dateIso),
  );
  const staticSlice = maxCap != null ? staticSorted.slice(0, maxCap) : staticSorted;
  const base = staticSlice;
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

async function listPhotoItemsFromDb(
  requestLang: Lang,
  query: ContentListQuery,
  opts?: ListContentRepositoryOpts,
): Promise<PaginatedResponse<PhotoGalleryItem>> {
  const where = buildCategoryYearWherePhoto(query);
  const maxCap = opts?.maxRowsFromDb;
  const withFacets = opts?.withFacets ?? true;
  const totalDb = await dashboardPrisma.dashboardPhoto.count({ where });
  const { effectiveTotal, totalPages, page, skip, take, pageSize } = listPaginationPlan(
    totalDb,
    query,
    maxCap,
  );
  const [facets, rawRows] = await Promise.all([
    withFacets
      ? facetCategoriesAndYearsPhoto()
      : Promise.resolve({ categories: [] as CategoryOption[], years: [] as YearOption[] }),
    take === 0
      ? Promise.resolve([])
      : dashboardPrisma.dashboardPhoto.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
          select: LIST_DOC_SELECT,
        }),
  ]);
  const rows = rawRows as PrismaContentDoc[];
  const items = rows.map((row) => mapDbPhotoItem(row, requestLang));
  return {
    items,
    categories: facets.categories,
    years: facets.years,
    pagination: {
      page,
      pageSize,
      totalItems: effectiveTotal,
      totalPages,
    },
  };
}

export async function listPhotoItems(
  query: ContentListQuery,
  lang?: Lang,
  opts?: ListContentRepositoryOpts,
): Promise<PaginatedResponse<PhotoGalleryItem>> {
  const requestLang = lang ?? (await getRequestLang());
  try {
    return await listPhotoItemsFromDb(requestLang, query, opts);
  } catch (err) {
    logDbListError("listPhotoItems", err);
    return listPhotoItemsStatic(requestLang, query, opts);
  }
}

function listVideoItemsStatic(
  requestLang: Lang,
  query: ContentListQuery,
  opts?: ListContentRepositoryOpts,
): PaginatedResponse<VideoGalleryItem> {
  const maxCap = opts?.maxRowsFromDb;
  const staticSorted = [...VIDEO_GALLERY_ITEMS].sort((a, b) =>
    b.dateIso.localeCompare(a.dateIso),
  );
  const staticSlice = maxCap != null ? staticSorted.slice(0, maxCap) : staticSorted;
  const base = staticSlice;
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

async function listVideoItemsFromDb(
  requestLang: Lang,
  query: ContentListQuery,
  opts?: ListContentRepositoryOpts,
): Promise<PaginatedResponse<VideoGalleryItem>> {
  const where = buildVideoListWhere(query);
  const maxCap = opts?.maxRowsFromDb;
  const withFacets = opts?.withFacets ?? true;
  const totalDb = await dashboardPrisma.dashboardVideo.count({ where });
  const { effectiveTotal, totalPages, page, skip, take, pageSize } = listPaginationPlan(
    totalDb,
    query,
    maxCap,
  );
  const [facets, rawRows] = await Promise.all([
    withFacets
      ? facetCategoriesAndYearsVideo()
      : Promise.resolve({ categories: [] as CategoryOption[], years: [] as YearOption[] }),
    take === 0
      ? Promise.resolve([])
      : dashboardPrisma.dashboardVideo.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take,
          select: LIST_DOC_SELECT,
        }),
  ]);
  const rows = rawRows as PrismaContentDoc[];
  const items = rows
    .filter((row) => !!row.videoUrl?.trim())
    .map((row) => mapDbVideoItem(row, requestLang));
  return {
    items,
    categories: facets.categories,
    years: facets.years,
    pagination: {
      page,
      pageSize,
      totalItems: effectiveTotal,
      totalPages,
    },
  };
}

export async function listCachedBlogPosts(
  query: ContentListQuery,
  lang: Lang,
  opts?: ListContentRepositoryOpts,
): Promise<PaginatedResponse<StudentNewsPost>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cms:blog", "cms:home");
  return listBlogPosts(query, lang, opts);
}

export async function listCachedActivityItems(
  query: ContentListQuery,
  lang: Lang,
  opts?: ListContentRepositoryOpts,
): Promise<PaginatedResponse<ActivityNewsItem>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cms:activity", "cms:home");
  return listActivityItems(query, lang, opts);
}

export async function listCachedPhotoItems(
  query: ContentListQuery,
  lang: Lang,
  opts?: ListContentRepositoryOpts,
): Promise<PaginatedResponse<PhotoGalleryItem>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cms:photo", "cms:home");
  return listPhotoItems(query, lang, opts);
}

export async function listCachedVideoItems(
  query: ContentListQuery,
  lang: Lang,
  opts?: ListContentRepositoryOpts,
): Promise<PaginatedResponse<VideoGalleryItem>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cms:video", "cms:home");
  return listVideoItems(query, lang, opts);
}

export async function listVideoItems(
  query: ContentListQuery,
  lang?: Lang,
  opts?: ListContentRepositoryOpts,
): Promise<PaginatedResponse<VideoGalleryItem>> {
  const requestLang = lang ?? (await getRequestLang());
  try {
    return await listVideoItemsFromDb(requestLang, query, opts);
  } catch (err) {
    logDbListError("listVideoItems", err);
    return listVideoItemsStatic(requestLang, query, opts);
  }
}
