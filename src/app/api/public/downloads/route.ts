import { NextResponse } from "next/server";
import { listDashboardContent } from "@/lib/dashboard/store";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const category = searchParams.get("category")?.trim();
  const rows = await listDashboardContent("download");
  const filtered = category
    ? rows.filter((row) => row.category.toLowerCase() === category.toLowerCase())
    : rows;

  return NextResponse.json({
    items: filtered.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      image: row.coverImage || "/brand/logo.png",
      fileUrl: row.fileUrl ?? "",
    })),
  });
}
