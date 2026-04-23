import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type DashboardContentType = "blog" | "activity" | "photo" | "video";
export type DashboardCategoryType = "blog" | "activity" | "photo" | "video";
export type DashboardCarouselRow = {
  id: string;
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
  title: string;
  category: string;
  dateIso: string;
  description?: string;
  coverImage?: string;
  videoUrl?: string;
  createdById?: string;
  status?: "pending" | "published";
};

export type DashboardCategoryRow = {
  id: string;
  name: string;
  slug: string;
  type: DashboardCategoryType;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function mapContentRow(row: {
  id: string;
  title: string;
  category: string;
  createdAt: Date;
  description: string | null;
  coverImage: string | null;
  videoUrl: string | null;
  createdById: string | null;
  status: string | null;
}): DashboardContentRow {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    dateIso: row.createdAt.toISOString(),
    description: row.description ?? undefined,
    coverImage: row.coverImage ?? undefined,
    videoUrl: row.videoUrl ?? undefined,
    createdById: row.createdById ?? undefined,
    status: row.status === "pending" || row.status === "published" ? row.status : undefined,
  };
}

export async function listDashboardContent(type: DashboardContentType): Promise<DashboardContentRow[]> {
  const rows = await prisma.dashboardContent.findMany({
    where: { type },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapContentRow);
}

export async function getDashboardContentById(
  type: DashboardContentType,
  id: string,
): Promise<DashboardContentRow | null> {
  const row = await prisma.dashboardContent.findFirst({
    where: { id, type },
  });
  return row ? mapContentRow(row) : null;
}

export async function createDashboardContent(
  type: DashboardContentType,
  input: Pick<DashboardContentRow, "title" | "category"> & {
    description?: string;
    coverImage?: string;
    videoUrl?: string;
    createdById?: string;
    status?: "pending" | "published";
  },
): Promise<DashboardContentRow> {
  const resolvedStatus =
    input.status ?? (type === "blog" ? "pending" : "published");
  const created = await prisma.dashboardContent.create({
    data: {
      type,
      title: input.title.trim(),
      category: input.category.trim(),
      description: input.description?.trim() ?? "",
      coverImage: input.coverImage?.trim() ?? "",
      videoUrl: input.videoUrl?.trim() || null,
      createdById: input.createdById,
      status: resolvedStatus,
      publishedAt: resolvedStatus === "published" ? new Date() : null,
    },
  });
  return mapContentRow(created);
}

export async function listDashboardContentByCreator(
  type: DashboardContentType,
  creatorId: string,
): Promise<DashboardContentRow[]> {
  const rows = await prisma.dashboardContent.findMany({
    where: { type, createdById: creatorId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapContentRow);
}

export async function listPendingBlogs(): Promise<DashboardContentRow[]> {
  const rows = await prisma.dashboardContent.findMany({
    where: { type: "blog", status: "pending" },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapContentRow);
}

export type PublicDashboardBlog = DashboardContentRow & {
  slug: string;
};

export async function listPublishedDashboardBlogs(): Promise<PublicDashboardBlog[]> {
  const rows = await prisma.dashboardContent.findMany({
    where: { type: "blog", status: "published" },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => {
    const item = mapContentRow(row);
    return {
      ...item,
      slug: slugify(item.title),
    };
  });
}

export async function getPublishedDashboardBlogBySlug(slug: string): Promise<PublicDashboardBlog | null> {
  const items = await listPublishedDashboardBlogs();
  return items.find((item) => item.slug === slug) ?? null;
}

export async function updateDashboardContent(
  type: DashboardContentType,
  id: string,
  input: Partial<
    Pick<
      DashboardContentRow,
      "title" | "category" | "description" | "coverImage" | "videoUrl" | "status"
    >
  >,
): Promise<DashboardContentRow | null> {
  const existing = await prisma.dashboardContent.findFirst({ where: { id, type } });
  if (!existing) return null;

  const updated = await prisma.dashboardContent.update({
    where: { id },
    data: {
      title: input.title?.trim(),
      category: input.category?.trim(),
      description:
        input.description !== undefined ? input.description.trim() : undefined,
      coverImage:
        input.coverImage !== undefined ? input.coverImage.trim() : undefined,
      videoUrl: input.videoUrl !== undefined ? input.videoUrl.trim() || null : undefined,
      status: input.status,
      publishedAt: input.status === "published" ? new Date() : undefined,
    },
  });
  return mapContentRow(updated);
}

export async function deleteDashboardContent(type: DashboardContentType, id: string): Promise<boolean> {
  const deleted = await prisma.dashboardContent.deleteMany({ where: { id, type } });
  return deleted.count > 0;
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

export async function deleteDashboardCategory(type: DashboardCategoryType, id: string): Promise<boolean> {
  const deleted = await prisma.dashboardCategory.deleteMany({ where: { id, type } });
  return deleted.count > 0;
}

export async function listDashboardCarousel(): Promise<DashboardCarouselRow[]> {
  const rows = await prisma.dashboardCarousel.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    imageUrl: row.imageUrl,
    ctaLabel: row.ctaLabel ?? undefined,
    ctaHref: row.ctaHref ?? undefined,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function createDashboardCarousel(
  input: Pick<
    DashboardCarouselRow,
    "title" | "subtitle" | "imageUrl" | "ctaLabel" | "ctaHref" | "isActive" | "sortOrder"
  >,
): Promise<DashboardCarouselRow> {
  const created = await prisma.dashboardCarousel.create({
    data: {
      title: input.title.trim(),
      subtitle: input.subtitle.trim(),
      imageUrl: input.imageUrl,
      ctaLabel: input.ctaLabel?.trim() || null,
      ctaHref: input.ctaHref?.trim() || null,
      isActive: input.isActive,
      sortOrder: input.sortOrder,
    },
  });
  return {
    id: created.id,
    title: created.title,
    subtitle: created.subtitle,
    imageUrl: created.imageUrl,
    ctaLabel: created.ctaLabel ?? undefined,
    ctaHref: created.ctaHref ?? undefined,
    isActive: created.isActive,
    sortOrder: created.sortOrder,
    createdAt: created.createdAt.toISOString(),
  };
}

export async function updateDashboardCarousel(
  id: string,
  input: Partial<
    Pick<
      DashboardCarouselRow,
      "title" | "subtitle" | "imageUrl" | "ctaLabel" | "ctaHref" | "isActive" | "sortOrder"
    >
  >,
): Promise<DashboardCarouselRow | null> {
  const existing = await prisma.dashboardCarousel.findUnique({ where: { id } });
  if (!existing) return null;
  const updated = await prisma.dashboardCarousel.update({
    where: { id },
    data: {
      title: input.title?.trim(),
      subtitle: input.subtitle?.trim(),
      imageUrl: input.imageUrl,
      ctaLabel: input.ctaLabel?.trim(),
      ctaHref: input.ctaHref?.trim(),
      isActive: input.isActive,
      sortOrder: input.sortOrder,
    },
  });
  return {
    id: updated.id,
    title: updated.title,
    subtitle: updated.subtitle,
    imageUrl: updated.imageUrl,
    ctaLabel: updated.ctaLabel ?? undefined,
    ctaHref: updated.ctaHref ?? undefined,
    isActive: updated.isActive,
    sortOrder: updated.sortOrder,
    createdAt: updated.createdAt.toISOString(),
  };
}

export async function deleteDashboardCarousel(id: string): Promise<boolean> {
  const deleted = await prisma.dashboardCarousel.deleteMany({ where: { id } });
  return deleted.count > 0;
}
