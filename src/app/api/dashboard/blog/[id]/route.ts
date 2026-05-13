import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  deleteDashboardBlog,
  getDashboardBlogById,
  updateDashboardBlog,
} from "@/lib/dashboard/store";
import type { LocaleContentMap } from "@/lib/i18n/content-locale";
import { hasMinimumRole } from "@/lib/roles";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const { id } = await params;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const existing = await getDashboardBlogById(id);
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
    status?: "pending" | "published";
  };
  if (body.category !== undefined && !body.category.trim()) {
    return NextResponse.json({ error: "Category is required" }, { status: 400 });
  }
  const updated = await updateDashboardBlog(id, {
    localeContent: body.localeContent,
    title: body.title,
    category: body.category,
    description: body.description,
    coverImage: body.coverImage,
    videoUrl: body.videoUrl,
    status: body.status,
  });
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const { id } = await params;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const row = await getDashboardBlogById(id);
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const canManageAll = hasMinimumRole(session.user.role, "ADMIN");
  if (!canManageAll && row.createdById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(row);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const { id } = await params;
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const existing = await getDashboardBlogById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const canManageAll = hasMinimumRole(session.user.role, "ADMIN");
  if (!canManageAll && existing.createdById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const removed = await deleteDashboardBlog(id);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
