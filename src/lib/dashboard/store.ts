import { Prisma } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { buildCarouselLocaleMapFromSource } from "@/lib/i18n/build-carousel-locale";
import { buildLocaleContentMapFromSource } from "@/lib/i18n/build-locale-content";
import {
  canonicalCategory,
  legacyCarouselMapFromFlat,
  legacyLocaleMapFromFlat,
  parseCarouselLocaleMap,
  parseLocaleContentMap,
  type CarouselLocaleMap,
  type ContentLocale,
  type LocaleContentMap,
} from "@/lib/i18n/content-locale";

export type DashboardContentType = "blog" | "activity" | "article" | "news" | "other-page" | "download" | "photo" | "video";
export type DashboardCategoryType = DashboardContentType;

type DashboardContentModelDelegate = {
  findFirst(args: unknown): Promise<unknown>;
  findMany(args: unknown): Promise<unknown[]>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
  deleteMany(args: unknown): Promise<{ count: number }>;
};

type DashboardPrismaClient = typeof prisma & {
  dashboardBlog: DashboardContentModelDelegate;
  dashboardActivity: DashboardContentModelDelegate;
  dashboardArticle: DashboardContentModelDelegate;
  dashboardNews: DashboardContentModelDelegate;
  dashboardOtherPageData: DashboardContentModelDelegate;
  dashboardDownload: DashboardContentModelDelegate;
  dashboardPhoto: DashboardContentModelDelegate;
  dashboardVideo: DashboardContentModelDelegate;
};

const dashboardPrisma = prisma as DashboardPrismaClient;

function prismaContentTable(type: DashboardContentType): DashboardContentModelDelegate {
  switch (type) {
    case "blog":
      return dashboardPrisma.dashboardBlog;
    case "activity":
      return dashboardPrisma.dashboardActivity;
    case "article":
      return dashboardPrisma.dashboardArticle;
    case "news":
      return dashboardPrisma.dashboardNews;
    case "other-page":
      return dashboardPrisma.dashboardOtherPageData;
    case "download":
      return dashboardPrisma.dashboardDownload;
    case "photo":
      return dashboardPrisma.dashboardPhoto;
    case "video":
      return dashboardPrisma.dashboardVideo;
  }
}

export type DashboardCarouselRow = {
  id: string;
  localeContent: CarouselLocaleMap;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel?: string;
  ctaHref?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
};

export type DashboardContentRow = {
  id: string;
  slug: string;
  localeContent: LocaleContentMap;
  title: string;
  category: string;
  dateIso: string;
  description?: string;
  coverImage?: string;
  videoUrl?: string;
  fileUrl?: string;
  createdById?: string;
  status?: "pending" | "published";
};

export type DashboardCategoryRow = {
  id: string;
  name: string;
  slug: string;
  type: DashboardCategoryType;
};

export type PublicDashboardBlog = DashboardContentRow;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type DbContentRow = {
  id: string;
  title: string;
  category: string;
  createdAt: Date;
  description: string | null;
  coverImage: string | null;
  videoUrl: string | null;
  fileUrl?: string | null;
  createdById: string | null;
  status: string | null;
  slug: string | null;
  localeContent: Prisma.JsonValue | null;
};

function resolveLocaleMap(row: DbContentRow): LocaleContentMap {
  const parsed = parseLocaleContentMap(row.localeContent);
  if (parsed) return parsed;
  return legacyLocaleMapFromFlat(row.title, row.category, row.description ?? "");
}

function resolveSlug(row: DbContentRow, map: LocaleContentMap): string {
  if (row.slug?.trim()) return row.slug.trim();
  return slugify(map.en.title) || slugify(map.ko.title) || slugify(map.bn.title) || row.id;
}

function mapContentRow(row: DbContentRow): DashboardContentRow {
  const localeContent = resolveLocaleMap(row);
  const slug = resolveSlug(row, localeContent);
  const en = localeContent.en;
  return {
    id: row.id,
    slug,
    localeContent,
    title: en.title || localeContent.ko.title || localeContent.bn.title,
    category: canonicalCategory(localeContent),
    dateIso: row.createdAt.toISOString(),
    description: en.description || localeContent.ko.description || localeContent.bn.description,
    coverImage: row.coverImage ?? undefined,
    videoUrl: row.videoUrl ?? undefined,
    fileUrl: row.fileUrl ?? undefined,
    createdById: row.createdById ?? undefined,
    status: row.status === "pending" || row.status === "published" ? row.status : undefined,
  };
}

type DbCarouselRow = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  localeContent: Prisma.JsonValue | null;
};

function resolveCarouselMap(row: DbCarouselRow): CarouselLocaleMap {
  const parsed = parseCarouselLocaleMap(row.localeContent);
  if (parsed) return parsed;
  return legacyCarouselMapFromFlat(row.title, row.subtitle, row.ctaLabel ?? "");
}

function mapCarouselRow(row: DbCarouselRow): DashboardCarouselRow {
  const localeContent = resolveCarouselMap(row);
  const en = localeContent.en;
  return {
    id: row.id,
    localeContent,
    title: en.title || localeContent.ko.title || localeContent.bn.title,
    subtitle: en.subtitle || localeContent.ko.subtitle || localeContent.bn.subtitle,
    imageUrl: row.imageUrl,
    ctaLabel: en.ctaLabel || localeContent.ko.ctaLabel || localeContent.bn.ctaLabel || undefined,
    ctaHref: row.ctaHref ?? undefined,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
  };
}

async function allocateUniqueContentSlug(type: DashboardContentType, base: string): Promise<string> {
  const s = (base || "item").slice(0, 120);
  const table = prismaContentTable(type);
  for (let i = 0; i < 80; i += 1) {
    const candidate = i === 0 ? s : `${base}-${i + 1}`.slice(0, 120);
    const exists = await table.findFirst({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
  }
  return `${base}-${Date.now()}`.slice(0, 120);
}

export async function listDashboardContent(type: DashboardContentType): Promise<DashboardContentRow[]> {
  const rows = await prismaContentTable(type).findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row: unknown) => mapContentRow(row as DbContentRow));
}

export async function listDashboardContentSummary(type: DashboardContentType): Promise<DashboardContentRow[]> {
  const rows = await prismaContentTable(type).findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      createdAt: true,
      description: true,
      coverImage: true,
      videoUrl: true,
      createdById: true,
      status: true,
      slug: true,
      localeContent: true,
    },
  });
  return rows.map((row: unknown) => mapContentRow(row as DbContentRow));
}

export async function getDashboardContentById(
  type: DashboardContentType,
  id: string,
): Promise<DashboardContentRow | null> {
  const row = await prismaContentTable(type).findFirst({
    where: { id },
  });
  return row ? mapContentRow(row as DbContentRow) : null;
}

export async function createDashboardContent(
  type: DashboardContentType,
  input: {
    sourceLocale?: ContentLocale;
    title?: string;
    category?: string;
    description?: string;
    coverImage?: string;
    videoUrl?: string;
    fileUrl?: string;
    createdById?: string;
    status?: "pending" | "published";
    localeContent?: LocaleContentMap;
  },
): Promise<DashboardContentRow> {
  const resolvedStatus = input.status ?? (type === "blog" ? "pending" : "published");
  const sourceLocale = input.sourceLocale ?? "en";
  const localeContent = input.localeContent || buildLocaleContentMapFromSource(sourceLocale, {
    title: (input.title ?? "").trim(),
    category: (input.category ?? "").trim(),
    description: (input.description ?? "").trim(),
  });
  const baseSlug =
    slugify(localeContent.en.title) ||
    slugify(localeContent[sourceLocale].title) ||
    "content";
  const uniqueSlug = await allocateUniqueContentSlug(type, baseSlug);
  const en = localeContent.en;
  const created = await prismaContentTable(type).create({
    data: {
      title: en.title || localeContent.ko.title || localeContent.bn.title,
      category: canonicalCategory(localeContent),
      description: en.description || localeContent.ko.description || localeContent.bn.description,
      coverImage: input.coverImage?.trim() ?? "",
      videoUrl: input.videoUrl?.trim() || null,
      ...(type === "download" ? { fileUrl: input.fileUrl?.trim() || null } : {}),
      createdById: input.createdById,
      status: resolvedStatus,
      publishedAt: resolvedStatus === "published" ? new Date() : null,
      slug: uniqueSlug,
      localeContent: localeContent as unknown as Prisma.InputJsonValue,
    },
  });
  return mapContentRow(created as DbContentRow);
}

export async function listDashboardContentByCreator(
  type: DashboardContentType,
  creatorId: string,
): Promise<DashboardContentRow[]> {
  const rows = await prismaContentTable(type).findMany({
    where: { createdById: creatorId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      createdAt: true,
      description: true,
      coverImage: true,
      videoUrl: true,
      createdById: true,
      status: true,
      slug: true,
      localeContent: true,
    },
  });
  return rows.map((row: unknown) => mapContentRow(row as DbContentRow));
}

export async function listPendingBlogs(): Promise<DashboardContentRow[]> {
  const rows = await dashboardPrisma.dashboardBlog.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row: unknown) => mapContentRow(row as DbContentRow));
}

export async function listPublishedDashboardBlogs(): Promise<PublicDashboardBlog[]> {
  const rows = await dashboardPrisma.dashboardBlog.findMany({
    where: { OR: [{ status: "published" }, { status: null }] },
    orderBy: { createdAt: "desc" },
    take: 2000,
  });
  return rows.map((row: unknown) => mapContentRow(row as DbContentRow));
}

export async function getPublishedDashboardBlogBySlug(slug: string): Promise<PublicDashboardBlog | null> {
  const direct = await dashboardPrisma.dashboardBlog.findFirst({
    where: {
      slug,
      OR: [{ status: "published" }, { status: null }],
    },
  });
  if (direct) {
    return mapContentRow(direct as DbContentRow);
  }
  /** Legacy rows without `slug`: scan a bounded set instead of every published post. */
  const legacy = await dashboardPrisma.dashboardBlog.findMany({
    where: {
      AND: [
        { OR: [{ status: "published" }, { status: null }] },
        { OR: [{ slug: null }, { slug: "" }] },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 600,
  });
  for (const row of legacy) {
    const mapped = mapContentRow(row as DbContentRow);
    if (mapped.slug === slug) return mapped;
    const map = mapped.localeContent;
    if (slugify(map.en.title) === slug) return mapped;
  }
  return null;
}

export async function updateDashboardContent(
  type: DashboardContentType,
  id: string,
  input: Partial<{
    localeContent: LocaleContentMap;
    title: string;
    category: string;
    description: string;
    coverImage: string;
    videoUrl: string;
    fileUrl: string;
    status: "pending" | "published";
  }>,
): Promise<DashboardContentRow | null> {
  const existing = await prismaContentTable(type).findFirst({ where: { id } });
  if (!existing) return null;

  let localeContent = resolveLocaleMap(existing as DbContentRow);

  if (input.localeContent) {
    localeContent = input.localeContent;
  } else if (
    input.title !== undefined ||
    input.category !== undefined ||
    input.description !== undefined
  ) {
    const en = { ...localeContent.en };
    if (input.title !== undefined) en.title = input.title.trim();
    if (input.category !== undefined) en.category = input.category.trim();
    if (input.description !== undefined) en.description = input.description.trim();
    localeContent = { ...localeContent, en };
  }

  const en = localeContent.en;
  const data = {
    title: en.title || localeContent.ko.title || localeContent.bn.title,
    category: canonicalCategory(localeContent),
    description: en.description || localeContent.ko.description || localeContent.bn.description,
    localeContent: localeContent as unknown as Prisma.InputJsonValue,
    ...(input.coverImage !== undefined ? { coverImage: input.coverImage?.trim() || null } : {}),
    ...(input.videoUrl !== undefined ? { videoUrl: input.videoUrl.trim() || null } : {}),
    ...(type === "download" && input.fileUrl !== undefined ? { fileUrl: input.fileUrl.trim() || null } : {}),
    ...(input.status !== undefined
      ? {
          status: input.status,
          publishedAt: input.status === "published" ? new Date() : null,
        }
      : {}),
  };

  let updated: DbContentRow;
  switch (type) {
    case "blog":
      updated = (await dashboardPrisma.dashboardBlog.update({ where: { id }, data })) as DbContentRow;
      break;
    case "activity":
      updated = (await dashboardPrisma.dashboardActivity.update({ where: { id }, data })) as DbContentRow;
      break;
    case "article":
      updated = (await dashboardPrisma.dashboardArticle.update({ where: { id }, data })) as DbContentRow;
      break;
    case "news":
      updated = (await dashboardPrisma.dashboardNews.update({ where: { id }, data })) as DbContentRow;
      break;
    case "other-page":
      updated = (await dashboardPrisma.dashboardOtherPageData.update({ where: { id }, data })) as DbContentRow;
      break;
    case "download":
      updated = (await dashboardPrisma.dashboardDownload.update({ where: { id }, data })) as DbContentRow;
      break;
    case "photo":
      updated = (await dashboardPrisma.dashboardPhoto.update({ where: { id }, data })) as DbContentRow;
      break;
    case "video":
      updated = (await dashboardPrisma.dashboardVideo.update({ where: { id }, data })) as DbContentRow;
      break;
  }
  return mapContentRow(updated);
}

export async function deleteDashboardContent(type: DashboardContentType, id: string): Promise<boolean> {
  const deleted = await prismaContentTable(type).deleteMany({ where: { id } });
  return deleted.count > 0;
}

type CreateDashboardContentPayload = Parameters<typeof createDashboardContent>[1];
type UpdateDashboardContentPayload = Parameters<typeof updateDashboardContent>[2];

/** Blog CMS — mirrors `listDashboardCarousel` / dedicated collection `DashboardBlog`. */
export async function listDashboardBlogs() {
  return listDashboardContentSummary("blog");
}
export async function listDashboardBlogsByCreator(creatorId: string) {
  return listDashboardContentByCreator("blog", creatorId);
}
export async function getDashboardBlogById(id: string) {
  return getDashboardContentById("blog", id);
}
export async function createDashboardBlog(input: CreateDashboardContentPayload) {
  return createDashboardContent("blog", input);
}
export async function updateDashboardBlog(id: string, input: UpdateDashboardContentPayload) {
  return updateDashboardContent("blog", id, input);
}
export async function deleteDashboardBlog(id: string) {
  return deleteDashboardContent("blog", id);
}

/** Activity CMS — collection `DashboardActivity`. */
export async function listDashboardActivities() {
  return listDashboardContentSummary("activity");
}
export async function listDashboardActivitiesByCreator(creatorId: string) {
  return listDashboardContentByCreator("activity", creatorId);
}
export async function getDashboardActivityById(id: string) {
  return getDashboardContentById("activity", id);
}
export async function createDashboardActivity(input: CreateDashboardContentPayload) {
  return createDashboardContent("activity", input);
}
export async function updateDashboardActivity(id: string, input: UpdateDashboardContentPayload) {
  return updateDashboardContent("activity", id, input);
}
export async function deleteDashboardActivity(id: string) {
  return deleteDashboardContent("activity", id);
}

/** Article CMS. */
export async function listDashboardArticles() {
  return listDashboardContentSummary("article");
}
export async function listDashboardArticlesByCreator(creatorId: string) {
  return listDashboardContentByCreator("article", creatorId);
}
export async function getDashboardArticleById(id: string) {
  return getDashboardContentById("article", id);
}
export async function createDashboardArticle(input: CreateDashboardContentPayload) {
  return createDashboardContent("article", input);
}
export async function updateDashboardArticle(id: string, input: UpdateDashboardContentPayload) {
  return updateDashboardContent("article", id, input);
}
export async function deleteDashboardArticle(id: string) {
  return deleteDashboardContent("article", id);
}

/** News CMS. */
export async function listDashboardNewsItems() {
  return listDashboardContentSummary("news");
}
export async function listDashboardNewsItemsByCreator(creatorId: string) {
  return listDashboardContentByCreator("news", creatorId);
}
export async function getDashboardNewsById(id: string) {
  return getDashboardContentById("news", id);
}
export async function createDashboardNews(input: CreateDashboardContentPayload) {
  return createDashboardContent("news", input);
}
export async function updateDashboardNews(id: string, input: UpdateDashboardContentPayload) {
  return updateDashboardContent("news", id, input);
}
export async function deleteDashboardNews(id: string) {
  return deleteDashboardContent("news", id);
}

/** Other page data CMS. */
export async function listDashboardOtherPageData() {
  return listDashboardContentSummary("other-page");
}
export async function listDashboardOtherPageDataByCreator(creatorId: string) {
  return listDashboardContentByCreator("other-page", creatorId);
}
export async function getDashboardOtherPageDataById(id: string) {
  return getDashboardContentById("other-page", id);
}
export async function createDashboardOtherPageData(input: CreateDashboardContentPayload) {
  return createDashboardContent("other-page", input);
}
export async function updateDashboardOtherPageData(id: string, input: UpdateDashboardContentPayload) {
  return updateDashboardContent("other-page", id, input);
}
export async function deleteDashboardOtherPageData(id: string) {
  return deleteDashboardContent("other-page", id);
}

/** Download CMS. */
export async function listDashboardDownloads() {
  return listDashboardContentSummary("download");
}
export async function listDashboardDownloadsByCreator(creatorId: string) {
  return listDashboardContentByCreator("download", creatorId);
}
export async function getDashboardDownloadById(id: string) {
  return getDashboardContentById("download", id);
}
export async function createDashboardDownload(input: CreateDashboardContentPayload) {
  return createDashboardContent("download", input);
}
export async function updateDashboardDownload(id: string, input: UpdateDashboardContentPayload) {
  return updateDashboardContent("download", id, input);
}
export async function deleteDashboardDownload(id: string) {
  return deleteDashboardContent("download", id);
}

/** Photo gallery CMS — collection `DashboardPhoto`. */
export async function listDashboardPhotos() {
  return listDashboardContentSummary("photo");
}
export async function listDashboardPhotosByCreator(creatorId: string) {
  return listDashboardContentByCreator("photo", creatorId);
}
export async function getDashboardPhotoById(id: string) {
  return getDashboardContentById("photo", id);
}
export async function createDashboardPhoto(input: CreateDashboardContentPayload) {
  return createDashboardContent("photo", input);
}
export async function updateDashboardPhoto(id: string, input: UpdateDashboardContentPayload) {
  return updateDashboardContent("photo", id, input);
}
export async function deleteDashboardPhoto(id: string) {
  return deleteDashboardContent("photo", id);
}

/** Video gallery CMS — collection `DashboardVideo`. */
export async function listDashboardVideos() {
  return listDashboardContentSummary("video");
}
export async function listDashboardVideosByCreator(creatorId: string) {
  return listDashboardContentByCreator("video", creatorId);
}
export async function getDashboardVideoById(id: string) {
  return getDashboardContentById("video", id);
}
export async function createDashboardVideo(input: CreateDashboardContentPayload) {
  return createDashboardContent("video", input);
}
export async function updateDashboardVideo(id: string, input: UpdateDashboardContentPayload) {
  return updateDashboardContent("video", id, input);
}
export async function deleteDashboardVideo(id: string) {
  return deleteDashboardContent("video", id);
}

export async function listDashboardCategories(type: DashboardCategoryType): Promise<DashboardCategoryRow[]> {
  const rows = await prisma.dashboardCategory.findMany({
    where: { type },
    orderBy: { name: "asc" },
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    type: row.type as DashboardCategoryType,
  }));
}

export async function createDashboardCategory(
  type: DashboardCategoryType,
  name: string,
): Promise<DashboardCategoryRow | null> {
  const trimmed = name.trim();
  const slug = slugify(trimmed);
  if (!trimmed || !slug) return null;
  try {
    const created = await prisma.dashboardCategory.create({
      data: { type, name: trimmed, slug },
    });
    return {
      id: created.id,
      name: created.name,
      slug: created.slug,
      type: created.type as DashboardCategoryType,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return null;
    }
    throw error;
  }
}

export async function updateDashboardCategory(
  type: DashboardCategoryType,
  id: string,
  name: string,
): Promise<DashboardCategoryRow | null> {
  const trimmed = name.trim();
  const slug = slugify(trimmed);
  if (!trimmed || !slug) return null;
  const existing = await prisma.dashboardCategory.findFirst({ where: { id, type } });
  if (!existing) return null;
  try {
    const updated = await prisma.dashboardCategory.update({
      where: { id },
      data: { name: trimmed, slug },
    });
    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      type: updated.type as DashboardCategoryType,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return null;
    }
    throw error;
  }
}

export async function getPublishedDashboardActivityBySlug(slug: string): Promise<DashboardContentRow | null> {
  const direct = await dashboardPrisma.dashboardActivity.findFirst({
    where: {
      slug,
      OR: [{ status: "published" }, { status: null }],
    },
  });
  if (direct) {
    return mapContentRow(direct as DbContentRow);
  }
  const legacy = await dashboardPrisma.dashboardActivity.findMany({
    where: {
      AND: [
        { OR: [{ status: "published" }, { status: null }] },
        { OR: [{ slug: null }, { slug: "" }] },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 600,
  });
  for (const row of legacy) {
    const mapped = mapContentRow(row as DbContentRow);
    if (mapped.slug === slug) return mapped;
    const map = mapped.localeContent;
    if (slugify(map.en.title) === slug) return mapped;
  }
  return null;
}

export async function deleteDashboardCategory(type: DashboardCategoryType, id: string): Promise<boolean> {
  const deleted = await prisma.dashboardCategory.deleteMany({ where: { id, type } });
  return deleted.count > 0;
}

export async function listDashboardCarousel(): Promise<DashboardCarouselRow[]> {
  const rows = await prisma.dashboardCarousel.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map((row) => mapCarouselRow(row as DbCarouselRow));
}

export async function listPublicDashboardCarousel(): Promise<DashboardCarouselRow[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("cms:carousel", "cms:home");
  try {
    const rows = await prisma.dashboardCarousel.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return rows.map((row) => mapCarouselRow(row as DbCarouselRow));
  } catch (error) {
    console.error("[listPublicDashboardCarousel]", error);
    return [];
  }
}

export async function createDashboardCarousel(
  input: Pick<
    DashboardCarouselRow,
    "imageUrl" | "ctaHref" | "isActive" | "sortOrder"
  > & {
    sourceLocale: ContentLocale;
    title: string;
    subtitle: string;
    ctaLabel?: string;
  },
): Promise<DashboardCarouselRow> {
  const localeContent = buildCarouselLocaleMapFromSource(input.sourceLocale, {
    title: input.title.trim(),
    subtitle: input.subtitle.trim(),
    ctaLabel: input.ctaLabel?.trim() ?? "",
  });
  const en = localeContent.en;
  const created = await prisma.dashboardCarousel.create({
    data: {
      title: en.title || localeContent.ko.title || localeContent.bn.title,
      subtitle: en.subtitle || localeContent.ko.subtitle || localeContent.bn.subtitle,
      imageUrl: input.imageUrl,
      ctaLabel: en.ctaLabel || localeContent.ko.ctaLabel || localeContent.bn.ctaLabel || null,
      ctaHref: input.ctaHref?.trim() || null,
      isActive: input.isActive,
      sortOrder: input.sortOrder,
      localeContent: localeContent as unknown as Prisma.InputJsonValue,
    },
  });
  return mapCarouselRow(created as DbCarouselRow);
}

export async function updateDashboardCarousel(
  id: string,
  input: Partial<
    Pick<DashboardCarouselRow, "imageUrl" | "ctaHref" | "isActive" | "sortOrder"> & {
      localeContent?: CarouselLocaleMap;
      title?: string;
      subtitle?: string;
      ctaLabel?: string;
    }
  >,
): Promise<DashboardCarouselRow | null> {
  const existing = await prisma.dashboardCarousel.findUnique({ where: { id } });
  if (!existing) return null;
  let localeContent = resolveCarouselMap(existing as DbCarouselRow);

  if (input.localeContent) {
    localeContent = input.localeContent;
  } else if (input.title !== undefined || input.subtitle !== undefined || input.ctaLabel !== undefined) {
    const en = { ...localeContent.en };
    if (input.title !== undefined) en.title = input.title.trim() ?? "";
    if (input.subtitle !== undefined) en.subtitle = input.subtitle.trim() ?? "";
    if (input.ctaLabel !== undefined) en.ctaLabel = input.ctaLabel.trim() ?? "";
    localeContent = { ...localeContent, en };
  }

  const en = localeContent.en;
  const updated = await prisma.dashboardCarousel.update({
    where: { id },
    data: {
      title: en.title || localeContent.ko.title || localeContent.bn.title,
      subtitle: en.subtitle || localeContent.ko.subtitle || localeContent.bn.subtitle,
      imageUrl: input.imageUrl,
      ctaLabel:
        input.ctaLabel !== undefined
          ? input.ctaLabel.trim() || null
          : en.ctaLabel || localeContent.ko.ctaLabel || localeContent.bn.ctaLabel || null,
      ctaHref: input.ctaHref?.trim(),
      isActive: input.isActive,
      sortOrder: input.sortOrder,
      localeContent: localeContent as unknown as Prisma.InputJsonValue,
    },
  });
  return mapCarouselRow(updated as DbCarouselRow);
}

export async function deleteDashboardCarousel(id: string): Promise<boolean> {
  const deleted = await prisma.dashboardCarousel.deleteMany({ where: { id } });
  return deleted.count > 0;
}
