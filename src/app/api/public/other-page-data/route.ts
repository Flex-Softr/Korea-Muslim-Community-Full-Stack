import { NextResponse } from "next/server";
import { listDashboardOtherPageData } from "@/lib/dashboard/store";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const category = searchParams.get("category")?.trim();
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.max(1, Number.parseInt(searchParams.get("pageSize") || "3", 10) || 3);
  const rows = await listDashboardOtherPageData();
  const filtered = category
    ? rows.filter((row) => row.category.toLowerCase() === category.toLowerCase())
    : rows;
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * pageSize;

  return NextResponse.json({
    items: filtered.slice(offset, offset + pageSize).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description ?? "",
      image: row.coverImage || "/brand/logo.png",
      category: row.category,
      slug: row.slug,
    })),
    pagination: {
      page: safePage,
      pageSize,
      totalItems,
      totalPages,
    },
  });
}
