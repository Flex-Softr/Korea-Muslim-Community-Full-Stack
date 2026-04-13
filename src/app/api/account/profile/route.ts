import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  name: z.string().max(120),
  bio: z.string().max(3000).optional().nullable(),
  imageUrl: z.string().max(4000).optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const member = await prisma.communityMember.findFirst({
    where: { contactEmail: user.email },
    select: { bio: true, imageUrl: true, aboutSummary: true },
  });
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: member?.bio ?? member?.aboutSummary ?? null,
      imageUrl: member?.imageUrl ?? null,
    },
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid name." }, { status: 400 });
  }

  const name = parsed.data.name.trim() || null;
  const bio = parsed.data.bio?.trim() || null;
  const imageUrl = parsed.data.imageUrl?.trim() || null;

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
    select: { id: true, name: true, email: true },
  });

  const displayName = name || updated.email.split("@")[0] || "Community member";
  const existingMember = await prisma.communityMember.findFirst({
    where: { contactEmail: updated.email },
    select: { id: true },
  });
  if (existingMember) {
    await prisma.communityMember.update({
      where: { id: existingMember.id },
      data: {
        name: displayName,
        bio,
        imageUrl,
        aboutSummary: bio ? bio.slice(0, 220) : null,
      },
    });
  } else {
    await prisma.communityMember.create({
      data: {
        name: displayName,
        category: "GENERAL",
        contactEmail: updated.email,
        bio,
        imageUrl,
        aboutSummary: bio ? bio.slice(0, 220) : null,
      },
    });
  }

  return NextResponse.json({ ok: true, user: { ...updated, bio, imageUrl } });
}
