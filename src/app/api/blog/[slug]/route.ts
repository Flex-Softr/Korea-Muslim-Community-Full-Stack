import { NextResponse } from "next/server";
import { getBlogPost } from "@/lib/content/repository";
import { parseLangQueryParam } from "@/lib/i18n/lang";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const lang = parseLangQueryParam(new URL(request.url).searchParams.get("lang"));
  const post = await getBlogPost(slug, lang);
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(post);
}
