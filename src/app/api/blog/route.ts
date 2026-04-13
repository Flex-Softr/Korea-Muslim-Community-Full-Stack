import { NextResponse } from "next/server";
import { listBlogPosts } from "@/lib/content/repository";
import { parseContentListQuery } from "@/lib/content/query";

export async function GET(request: Request) {
  const query = parseContentListQuery(new URL(request.url).searchParams);
  const data = await listBlogPosts(query);
  return NextResponse.json(data);
}
