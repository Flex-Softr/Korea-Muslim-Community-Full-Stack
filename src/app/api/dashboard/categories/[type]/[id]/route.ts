import { NextResponse } from "next/server";
import {
  deleteDashboardCategory,
  updateDashboardCategory,
  type DashboardCategoryType,
} from "@/lib/dashboard/store";

function parseType(value: string): DashboardCategoryType | null {
  if (value === "blog" || value === "activity" || value === "photo" || value === "video") {
    return value;
  }
  return null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const { type, id } = await params;
  const parsed = parseType(type);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  const body = (await request.json()) as { name?: string };
  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const updated = await updateDashboardCategory(parsed, id, body.name);
  if (!updated) {
    return NextResponse.json({ error: "Duplicate, invalid, or not found" }, { status: 400 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ type: string; id: string }> },
) {
  const { type, id } = await params;
  const parsed = parseType(type);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  const removed = await deleteDashboardCategory(parsed, id);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
