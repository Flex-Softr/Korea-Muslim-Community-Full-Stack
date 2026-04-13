import { NextResponse } from "next/server";
import { parseContentListQuery } from "@/lib/content/query";
import { listPhotoItems } from "@/lib/content/repository";

export async function GET(request: Request) {
  const query = parseContentListQuery(new URL(request.url).searchParams);
  const data = await listPhotoItems(query);
  return NextResponse.json(data);
}
