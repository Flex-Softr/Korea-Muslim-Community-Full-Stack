import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createDashboardActivity,
  listDashboardActivitiesByCreator,
  listDashboardActivities,
} from "@/lib/dashboard/store";
import { normalizeContentLocale } from "@/lib/i18n/content-locale";
import { hasMinimumRole } from "@/lib/roles";
import { revalidateCmsContent } from "@/lib/cms/cache-invalidation";

export async function GET(request: Request) {
  const session = await auth();
  const searchParams = new URL(request.url).searchParams;
  const mine = searchParams.get("mine") === "true";
  if (mine) {
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({
      items: await listDashboardActivitiesByCreator(session.user.id),
    });
  }
  return NextResponse.json({
    items: await listDashboardActivities(),
    currentUserId: session?.user?.id ?? null,
    canManageAll: hasMinimumRole(session?.user?.role, "ADMIN"),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  const body = (await request.json()) as {
    sourceLocale?: string;
    title?: string;
    category?: string;
    description?: string;
    coverImage?: string;
    videoUrl?: string;
  };
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!body.category?.trim()) {
    return NextResponse.json({ error: "Category is required" }, { status: 400 });
  }
  if (!body.description?.trim()) {
    return NextResponse.json({ error: "Description is required" }, { status: 400 });
  }

  const sourceLocale = normalizeContentLocale(body.sourceLocale);

  const created = await createDashboardActivity({
    sourceLocale,
    title: body.title,
    category: body.category.trim(),
    description: body.description?.trim(),
    coverImage: body.coverImage?.trim(),
    videoUrl: body.videoUrl,
    createdById: session?.user?.id ?? undefined,
  });
  revalidateCmsContent("activity");
  return NextResponse.json(created, { status: 201 });
}
