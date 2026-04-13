import type { ContentListQuery } from "@/lib/content/types";

export function parseContentListQuery(searchParams: URLSearchParams): ContentListQuery {
  const category = searchParams.get("category");
  const yearRaw = searchParams.get("year");
  const pageRaw = searchParams.get("page");
  const limitRaw = searchParams.get("limit");

  const parsedYear = yearRaw ? Number.parseInt(yearRaw, 10) : null;
  const parsedPage = pageRaw ? Number.parseInt(pageRaw, 10) : 1;
  const parsedLimit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined;

  return {
    category: category?.trim() ? category.trim() : null,
    year:
      parsedYear != null && Number.isFinite(parsedYear) ? parsedYear : null,
    page: Number.isFinite(parsedPage) ? parsedPage : 1,
    pageSize:
      parsedLimit != null && Number.isFinite(parsedLimit) ? parsedLimit : undefined,
  };
}
