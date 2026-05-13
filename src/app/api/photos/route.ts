import { NextResponse } from "next/server";
import { parseContentListQuery } from "@/lib/content/query";
import {
  listPhotoItems,
  repositoryOptsForListQuery,
} from "@/lib/content/repository";
import { parseLangQueryParam } from "@/lib/i18n/lang";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = parseContentListQuery(url.searchParams);
  const lang = parseLangQueryParam(url.searchParams.get("lang"));
  const data = await listPhotoItems(
    query,
    lang,
    repositoryOptsForListQuery(query),
  );
  return NextResponse.json(data);
}
