import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { addBlogComment, listBlogComments } from "@/lib/blog-comments-store";
import { getPublicBlogBySlug } from "@/lib/public-blog";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await getPublicBlogBySlug(slug);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ items: listBlogComments(slug) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const post = await getPublicBlogBySlug(slug);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await request.json()) as { content?: string };
  const content = body.content?.trim() || "";
  if (!content) {
    return NextResponse.json({ error: "Comment is required" }, { status: 400 });
  }

  const created = addBlogComment({
    slug,
    userId: session.user.id,
    userName: session.user.name?.trim() || session.user.email,
    userEmail: session.user.email,
    content,
  });
  return NextResponse.json(created, { status: 201 });
}
