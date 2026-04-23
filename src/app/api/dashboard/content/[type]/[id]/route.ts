import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  deleteDashboardContent,
  getDashboardContentById,
  updateDashboardContent,
  type DashboardContentType,
} from "@/lib/dashboard/store";
import { hasMinimumRole } from "@/lib/roles";

function parseType(value: string): DashboardContentType | null {
  if (value === "blog" || value === "activity" || value === "photo" || value === "video") return value;
  return null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const session = await auth();
  const { type, id } = await params;
  const parsed = parseType(type);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const existing = await getDashboardContentById(parsed, id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const canManageAll = hasMinimumRole(session.user.role, "ADMIN");
  if (!canManageAll && existing.createdById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
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
  const updated = await updateDashboardContent(parsed, id, body);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const session = await auth();
  const { type, id } = await params;
  const parsed = parseType(type);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const row = await getDashboardContentById(parsed, id);
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
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const session = await auth();
  const { type, id } = await params;
  const parsed = parseType(type);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const existing = await getDashboardContentById(parsed, id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const canManageAll = hasMinimumRole(session.user.role, "ADMIN");
  if (!canManageAll && existing.createdById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const removed = await deleteDashboardContent(parsed, id);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
