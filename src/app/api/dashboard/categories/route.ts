import { NextResponse } from "next/server";
import {
  createDashboardCategory,
  listDashboardCategories,
  type DashboardCategoryType,
} from "@/lib/dashboard/store";

function parseType(value: string | null): DashboardCategoryType | null {
  if (!value) return null;
  if (
    value === "blog" ||
    value === "activity" ||
    value === "article" ||
    value === "news" ||
    value === "other-page" ||
    value === "download" ||
    value === "photo" ||
    value === "video"
  ) {
    return value;
  }
  return null;
}

export async function GET(request: Request) {
  const type = parseType(new URL(request.url).searchParams.get("type"));
  if (!type) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  return NextResponse.json({ items: await listDashboardCategories(type) });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { type?: string; name?: string };
  const type = parseType(body.type ?? null);
  if (!type || !body.name?.trim()) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const created = await createDashboardCategory(type, body.name);
  if (!created) {
    return NextResponse.json({ error: "Duplicate or invalid category" }, { status: 400 });
  }
  return NextResponse.json(created, { status: 201 });
}
