import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createDashboardCarousel, listDashboardCarousel } from "@/lib/dashboard/store";
import { normalizeContentLocale } from "@/lib/i18n/content-locale";
import { hasMinimumRole } from "@/lib/roles";
import { revalidateCmsCarousel } from "@/lib/cms/cache-invalidation";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !hasMinimumRole(session.user.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ items: await listDashboardCarousel() });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !hasMinimumRole(session.user.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = (await request.json()) as {
    sourceLocale?: string;
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    ctaLabel?: string;
    ctaHref?: string;
    isActive?: boolean;
    sortOrder?: number;
  };

  if (!body.title?.trim() || !body.subtitle?.trim() || !body.imageUrl) {
    return NextResponse.json({ error: "Title, subtitle and image are required." }, { status: 400 });
  }

  const sourceLocale = normalizeContentLocale(body.sourceLocale);

  const created = await createDashboardCarousel({
    sourceLocale,
    title: body.title,
    subtitle: body.subtitle,
    imageUrl: body.imageUrl,
    ctaLabel: body.ctaLabel,
    ctaHref: body.ctaHref,
    isActive: body.isActive ?? true,
    sortOrder: Number.isFinite(body.sortOrder) ? Number(body.sortOrder) : 1,
  });
  revalidateCmsCarousel();

  return NextResponse.json(created, { status: 201 });
}
