import { NextResponse } from "next/server";
import { parseContentListQuery } from "@/lib/content/query";
import { listVideoItems } from "@/lib/content/repository";

export async function GET(request: Request) {
  const query = parseContentListQuery(new URL(request.url).searchParams);
  const data = await listVideoItems(query);
  return NextResponse.json(data);
}
