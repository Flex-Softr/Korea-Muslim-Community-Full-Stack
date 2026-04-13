import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listPendingBlogs } from "@/lib/dashboard/store";
import { hasMinimumRole } from "@/lib/roles";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !hasMinimumRole(session.user.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pending = await listPendingBlogs();
  const creatorIds = [...new Set(pending.map((item) => item.createdById).filter(Boolean))] as string[];
  const users = creatorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: creatorIds } },
        select: { id: true, name: true, email: true },
      })
    : [];
  const byId = new Map(users.map((user) => [user.id, user]));

  const items = pending.map((item) => {
    const author = item.createdById ? byId.get(item.createdById) : null;
    return {
      id: item.id,
      title: item.title,
      dateIso: item.dateIso,
      authorName: author?.name || author?.email || "Unknown",
      authorEmail: author?.email || null,
    };
  });

  return NextResponse.json({ items });
}
