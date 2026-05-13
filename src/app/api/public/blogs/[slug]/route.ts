import { NextResponse } from "next/server";
import { getPublicBlogBySlug } from "@/lib/public-blog";
import { toCmsTextDetailSource } from "@/lib/cms/cms-detail-locale-source";

function formatDate(dateIso: string): string {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const post = await getPublicBlogBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const source = toCmsTextDetailSource({
      id: post.slug,
      slug: post.slug,
      imageSrc: post.thumbnail ?? "/brand/logo.png",
      dateIso: post.dateIso,
      date: formatDate(post.dateIso),
      title: post.title,
      category: post.category,
      body: post.contentHtml,
      localeContent: post.localeContent ?? null,
    });
    return NextResponse.json({
      source,
      dateLabel: formatDate(post.dateIso),
      showHeroImage: !!post.thumbnail,
      authorName: post.author.name,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
