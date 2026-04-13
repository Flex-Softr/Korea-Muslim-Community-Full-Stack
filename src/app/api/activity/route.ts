import { NextResponse } from "next/server";
import { parseContentListQuery } from "@/lib/content/query";
import { listActivityItems } from "@/lib/content/repository";

export async function GET(request: Request) {
  const query = parseContentListQuery(new URL(request.url).searchParams);
  const data = await listActivityItems(query);
  return NextResponse.json(data);
}
