import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listDashboardBlogsByCreator } from "@/lib/dashboard/store";
import { isMemberCategory } from "@/lib/members/config";
import { hasMinimumRole } from "@/lib/roles";
import { isSuspendedUser, setSuspendedUser } from "@/lib/dashboard/user-status-store";

function statusFrom(user: { id: string; emailVerified: Date | null }) {
  if (isSuspendedUser(user.id)) return "suspended";
  return user.emailVerified ? "active" : "pending";
}

async function ensureAdmin() {
  const session = await auth();
  if (!session?.user?.id || !hasMinimumRole(session.user.role, "ADMIN")) {
    return false;
  }
  return true;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const profile = await prisma.communityMember.findFirst({
    where: { contactEmail: user.email },
    select: {
      aboutSummary: true,
      bio: true,
      imageUrl: true,
    },
  });
  const submittedBlogs = (await listDashboardBlogsByCreator(user.id)).map((item) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    dateIso: item.dateIso,
  }));

  return NextResponse.json({
    ...user,
    status: statusFrom(user),
    profile,
    submittedBlogs,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = (await request.json()) as {
    role?: "USER" | "ADMIN";
    suspend?: boolean;
    approve?: boolean;
    convertToMember?: boolean;
    convertToMemberRole?: string;
  };

  if (body.role) {
    const updated = await prisma.user.update({
      where: { id },
      data: { role: body.role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ ...updated, status: statusFrom(updated) });
  }

  if (typeof body.suspend === "boolean") {
    setSuspendedUser(id, body.suspend);
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ...user, status: statusFrom(user) });
  }

  if (body.approve === true) {
    setSuspendedUser(id, false);
    const updated = await prisma.user.update({
      where: { id },
      data: { emailVerified: new Date() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ ...updated, status: statusFrom(updated) });
  }

  if (body.convertToMember === true) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existing = await prisma.communityMember.findFirst({
      where: { contactEmail: user.email },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: "User is already a member." }, { status: 400 });
    }

    const convertRole = (body.convertToMemberRole ?? "EXECUTIVE").trim().toUpperCase();
    if (!isMemberCategory(convertRole)) {
      return NextResponse.json({ error: "Invalid member role." }, { status: 400 });
    }

    const created = await prisma.communityMember.create({
      data: {
        name: user.name?.trim() || user.email.split("@")[0] || "Member",
        contactEmail: user.email,
        category: convertRole,
        profileVisibility: "MEMBERS_ONLY",
      },
      select: {
        id: true,
        name: true,
        contactEmail: true,
        category: true,
      },
    });
    return NextResponse.json({ ok: true, member: created });
  }

  return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.user.delete({ where: { id } });
  setSuspendedUser(id, false);
  return NextResponse.json({ ok: true });
}
