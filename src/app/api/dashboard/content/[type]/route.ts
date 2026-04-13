import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createDashboardContent,
  listDashboardContentByCreator,
  listDashboardContent,
  type DashboardContentType,
} from "@/lib/dashboard/store";

function parseType(value: string): DashboardContentType | null {
  if (value === "blog" || value === "activity" || value === "photo" || value === "video") return value;
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const { type } = await params;
  const parsed = parseType(type);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  const searchParams = new URL(request.url).searchParams;
  const mine = searchParams.get("mine") === "true";
  if (mine) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ items: await listDashboardContentByCreator(parsed, session.user.id) });
  }
  return NextResponse.json({ items: await listDashboardContent(parsed) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const session = await auth();
  const { type } = await params;
  const parsed = parseType(type);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const body = (await request.json()) as {
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
  if (parsed === "photo" && !body.coverImage?.trim()) {
    return NextResponse.json({ error: "Cover image is required" }, { status: 400 });
  }
  if ((parsed === "blog" || parsed === "activity") && !body.description?.trim()) {
    return NextResponse.json({ error: "Description is required" }, { status: 400 });
  }
  if (parsed === "video" && !body.videoUrl?.trim()) {
    return NextResponse.json({ error: "Video URL is required" }, { status: 400 });
  }

  const created = await createDashboardContent(parsed, {
    title: body.title,
    category: body.category.trim(),
    description: body.description?.trim(),
    coverImage: body.coverImage?.trim(),
    videoUrl: body.videoUrl,
    createdById: session?.user?.id ?? undefined,
  });
  return NextResponse.json(created, { status: 201 });
}
