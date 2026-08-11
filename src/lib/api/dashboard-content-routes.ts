import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createDashboardContent,
  deleteDashboardContent,
  getDashboardContentById,
  listDashboardContentByCreator,
  listDashboardContentSummary,
  updateDashboardContent,
  type DashboardContentType,
} from "@/lib/dashboard/store";
import {
  normalizeDownloadFileSource,
  validateDownloadFileUrl,
  type DownloadFileSource,
} from "@/lib/download-file";
import { normalizeContentLocale } from "@/lib/i18n/content-locale";
import type { LocaleContentMap } from "@/lib/i18n/content-locale";
import { hasMinimumRole } from "@/lib/roles";
import { revalidateCmsContent } from "@/lib/cms/cache-invalidation";

export function dashboardContentCollectionHandlers(type: DashboardContentType) {
  return {
    async GET(request: Request) {
      const session = await auth();
      const searchParams = new URL(request.url).searchParams;
      const mine = searchParams.get("mine") === "true";
      if (mine) {
        if (!session?.user?.id) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({
          items: await listDashboardContentByCreator(type, session.user.id),
        });
      }
      return NextResponse.json({
        items: await listDashboardContentSummary(type),
        currentUserId: session?.user?.id ?? null,
        canManageAll: hasMinimumRole(session?.user?.role, "ADMIN"),
      });
    },

    async POST(request: Request) {
      const session = await auth();
      const body = (await request.json()) as {
        sourceLocale?: string;
        title?: string;
        category?: string;
        description?: string;
        coverImage?: string;
        videoUrl?: string;
        fileUrl?: string;
        fileSource?: DownloadFileSource;
        localeContent?: LocaleContentMap;
      };

      if (body.localeContent) {
        const sourceLocale = normalizeContentLocale(body.sourceLocale);
        const block = body.localeContent[sourceLocale] || body.localeContent.en;
        if (!block?.title?.trim()) {
          return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }
        if (!block?.category?.trim()) {
          return NextResponse.json({ error: "Category is required" }, { status: 400 });
        }
        if (type !== "download" && !block?.description?.trim()) {
          return NextResponse.json({ error: "Description is required" }, { status: 400 });
        }
      } else {
        if (!body.title?.trim()) {
          return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }
        if (!body.category?.trim()) {
          return NextResponse.json({ error: "Category is required" }, { status: 400 });
        }
        if (type !== "download" && !body.description?.trim()) {
          return NextResponse.json({ error: "Description is required" }, { status: 400 });
        }
      }
      if (type === "download") {
        const fileSource = normalizeDownloadFileSource(body.fileSource, body.fileUrl);
        const fileError = validateDownloadFileUrl(body.fileUrl ?? "", fileSource);
        if (fileError) {
          return NextResponse.json({ error: fileError }, { status: 400 });
        }
        body.fileSource = fileSource;
        body.fileUrl = body.fileUrl?.trim();
      }

      const created = await createDashboardContent(type, {
        sourceLocale: normalizeContentLocale(body.sourceLocale),
        title: body.title,
        category: body.category?.trim(),
        description: body.description?.trim() ?? "",
        coverImage: body.coverImage?.trim(),
        videoUrl: body.videoUrl,
        fileUrl: body.fileUrl,
        fileSource: body.fileSource,
        createdById: session?.user?.id ?? undefined,
        status: "published",
        localeContent: body.localeContent,
      });
      revalidateCmsContent(type);
      return NextResponse.json(created, { status: 201 });
    },
  };
}

export function dashboardContentItemHandlers(type: DashboardContentType) {
  return {
    async GET(
      _request: Request,
      { params }: { params: Promise<{ id: string }> },
    ) {
      const session = await auth();
      const { id } = await params;
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const row = await getDashboardContentById(type, id);
      if (!row) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const canManageAll = hasMinimumRole(session.user.role, "ADMIN");
      if (!canManageAll && row.createdById !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.json(row);
    },

    async PATCH(
      request: Request,
      { params }: { params: Promise<{ id: string }> },
    ) {
      const session = await auth();
      const { id } = await params;
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const existing = await getDashboardContentById(type, id);
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const canManageAll = hasMinimumRole(session.user.role, "ADMIN");
      if (!canManageAll && existing.createdById !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const body = (await request.json()) as {
        localeContent?: LocaleContentMap;
        title?: string;
        category?: string;
        description?: string;
        coverImage?: string;
        videoUrl?: string;
        fileUrl?: string;
        fileSource?: DownloadFileSource;
        status?: "pending" | "published";
      };
      if (body.category !== undefined && !body.category.trim()) {
        return NextResponse.json({ error: "Category is required" }, { status: 400 });
      }
      if (type === "download" && (body.fileUrl !== undefined || body.fileSource !== undefined)) {
        const fileSource = normalizeDownloadFileSource(
          body.fileSource ?? existing.fileSource,
          body.fileUrl ?? existing.fileUrl,
        );
        const fileError = validateDownloadFileUrl(
          body.fileUrl ?? existing.fileUrl ?? "",
          fileSource,
        );
        if (fileError) {
          return NextResponse.json({ error: fileError }, { status: 400 });
        }
        body.fileSource = fileSource;
        if (body.fileUrl !== undefined) {
          body.fileUrl = body.fileUrl.trim();
        }
      }
      const updated = await updateDashboardContent(type, id, body);
      if (!updated) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      revalidateCmsContent(type);
      return NextResponse.json(updated);
    },

    async DELETE(
      _request: Request,
      { params }: { params: Promise<{ id: string }> },
    ) {
      const session = await auth();
      const { id } = await params;
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const existing = await getDashboardContentById(type, id);
      if (!existing) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      const canManageAll = hasMinimumRole(session.user.role, "ADMIN");
      if (!canManageAll && existing.createdById !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const removed = await deleteDashboardContent(type, id);
      if (!removed) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      revalidateCmsContent(type);
      return NextResponse.json({ ok: true });
    },
  };
}
