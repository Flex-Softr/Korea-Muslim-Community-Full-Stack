import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasMinimumRole } from "@/lib/roles";
import { getSuspendedUserIds, isSuspendedUser } from "@/lib/dashboard/user-status-store";
import { clampPage, offsetForPage, totalPagesFromCount } from "@/lib/pagination/get-pagination-items";

type UserStatus = "pending" | "active" | "suspended";

function getStatus(user: { id: string; emailVerified: Date | null }): UserStatus {
  if (isSuspendedUser(user.id)) return "suspended";
  return user.emailVerified ? "active" : "pending";
}

function buildUserListWhere(
  q: string,
  role: string,
  statusFilter: string,
): Prisma.UserWhereInput {
  const suspendedIds = getSuspendedUserIds();
  const base: Prisma.UserWhereInput = {
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

  const s = statusFilter.toLowerCase();
  if (!s) return base;
  if (s === "suspended") {
    if (suspendedIds.length === 0) {
      return { ...base, id: { in: [] } };
    }
    return { ...base, id: { in: suspendedIds } };
  }
  if (s === "pending") {
    return {
      ...base,
      emailVerified: null,
      ...(suspendedIds.length ? { id: { notIn: suspendedIds } } : {}),
    };
  }
  if (s === "active") {
    return {
      ...base,
      emailVerified: { not: null },
      ...(suspendedIds.length ? { id: { notIn: suspendedIds } } : {}),
    };
  }
  return base;
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
  const pageRaw = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.max(1, Number.parseInt(searchParams.get("pageSize") ?? "10", 10) || 10);
  const countOnly = searchParams.get("count") === "true";

  const where = buildUserListWhere(q, role, status);

  const rawTotal = await prisma.user.count({ where });

  if (countOnly) {
    return NextResponse.json({ count: rawTotal });
  }

  const totalPages = totalPagesFromCount(rawTotal, pageSize);
  const safePage = clampPage(pageRaw, totalPages);

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: offsetForPage(safePage, pageSize),
    take: pageSize,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  const emails = users.map((user) => user.email);
  const memberRows =
    emails.length > 0
      ? await prisma.communityMember.findMany({
          where: {
            contactEmail: {
              in: emails,
            },
          },
          select: {
            contactEmail: true,
          },
        })
      : [];

  const memberEmails = new Set(
    memberRows
      .map((row) => row.contactEmail?.toLowerCase())
      .filter((email): email is string => Boolean(email)),
  );

  const items = users.map((user) => ({
    ...user,
    status: getStatus(user),
    isMember: memberEmails.has(user.email.toLowerCase()),
  }));

  return NextResponse.json({
    items,
    pagination: {
      page: safePage,
      pageSize,
      totalItems: rawTotal,
      totalPages,
    },
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !hasMinimumRole(session.user.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | {
        name?: string;
        email?: string;
        password?: string;
      }
    | null;

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);
  const created = await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      user: {
        ...created,
        status: getStatus(created),
      },
    },
    { status: 201 },
  );
}
