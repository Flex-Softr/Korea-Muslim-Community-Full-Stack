import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasMinimumRole } from "@/lib/roles";
import { isSuspendedUser } from "@/lib/dashboard/user-status-store";

type UserStatus = "pending" | "active" | "suspended";

function getStatus(user: { id: string; emailVerified: Date | null }): UserStatus {
  if (isSuspendedUser(user.id)) return "suspended";
  return user.emailVerified ? "active" : "pending";
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !hasMinimumRole(session.user.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("search") ?? "").trim();
  const role = (searchParams.get("role") ?? "").trim().toUpperCase();
  const status = (searchParams.get("status") ?? "").trim().toLowerCase();
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.max(1, Number.parseInt(searchParams.get("pageSize") ?? "10", 10) || 10);
  const countOnly = searchParams.get("count") === "true";

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
          ],
        }
      : {}),
    ...(role ? { role } : {}),
  };

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  const withStatus = users
    .map((user) => ({
      ...user,
      status: getStatus(user),
    }))
    .filter((user) => (status ? user.status === status : true));

  const totalItems = withStatus.length;
  if (countOnly) {
    return NextResponse.json({ count: totalItems });
  }
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * pageSize;
  const items = withStatus.slice(offset, offset + pageSize);

  return NextResponse.json({
    items,
    pagination: {
      page: safePage,
      pageSize,
      totalItems,
      totalPages,
    },
  });
}
