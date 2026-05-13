import { NextResponse } from "next/server";
import { getActivityItem } from "@/lib/content/repository";
import { parseLangQueryParam } from "@/lib/i18n/lang";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const lang = parseLangQueryParam(new URL(request.url).searchParams.get("lang"));
  const item = await getActivityItem(slug, lang);
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}
