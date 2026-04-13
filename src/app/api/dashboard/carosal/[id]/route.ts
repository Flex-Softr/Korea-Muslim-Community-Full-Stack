import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteDashboardCarousel, updateDashboardCarousel } from "@/lib/dashboard/store";
import { hasMinimumRole } from "@/lib/roles";

async function ensureAdmin() {
  const session = await auth();
  return !!(session?.user?.id && hasMinimumRole(session.user.role, "ADMIN"));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = (await request.json()) as {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    ctaLabel?: string;
    ctaHref?: string;
    isActive?: boolean;
    sortOrder?: number;
  };

  const updated = await updateDashboardCarousel(id, {
    title: body.title,
    subtitle: body.subtitle,
    imageUrl: body.imageUrl,
    ctaLabel: body.ctaLabel,
    ctaHref: body.ctaHref,
    isActive: body.isActive,
    sortOrder: Number.isFinite(body.sortOrder) ? Number(body.sortOrder) : undefined,
  });

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const removed = await deleteDashboardCarousel(id);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
