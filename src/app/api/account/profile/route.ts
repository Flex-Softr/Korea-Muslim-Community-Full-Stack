import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  ACADEMIC_STATUSES,
  deriveAcademicStatus,
  mapRegisterToMemberFields,
  parseAboutSummary,
  type ApiAcademicStatus,
} from "@/lib/account/profile-mappers";
import type { AccountMemberPayload, AccountProfileResponse } from "@/lib/account/profile-types";
import { createUniqueMemberCode } from "@/lib/member-code";
import { prisma } from "@/lib/prisma";

const DEGREES = ["Bachelor", "Masters", "PhD"] as const;

const imageValueSchema = z
  .string()
  .max(8_000_000, "Image data is too large.")
  .refine(
    (value) =>
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("data:image/"),
    "Images must be valid URLs or image data.",
  );

const optionalImageSchema = imageValueSchema.optional().nullable();

const patchBodySchema = z.object({
  name: z.string().min(1, "Full name (English) is required.").max(120, "Name must be at most 120 characters."),
  nameBn: z.string().max(200).optional().nullable(),
  phone: z.string().min(1, "Phone is required.").max(60),
  academicStatus: z.enum(ACADEMIC_STATUSES),
  universityName: z.string().min(1).max(400),
  department: z.string().min(1).max(400),
  degree: z.enum(DEGREES),
  sessionIntake: z.string().min(1, "Session/intake is required.").max(200),
  cityKorea: z.string().min(1).max(200),
  profilePhoto: optionalImageSchema,
  studentIdImage: optionalImageSchema,
  reasonToJoin: z.string().max(8000).optional().nullable(),
});

function normalizeDegree(value: string | null | undefined): (typeof DEGREES)[number] | "" {
  if (value && (DEGREES as readonly string[]).includes(value)) {
    return value as (typeof DEGREES)[number];
  }
  return "";
}

function memberToPayload(
  member: {
    memberCode: string | null;
    nameBn: string | null;
    phone: string | null;
    universityKr: string | null;
    major: string | null;
    degree: string | null;
    studyStatus: string | null;
    occupationType: string | null;
    aboutSummary: string | null;
    locationCity: string | null;
    imageUrl: string | null;
    certifications: string | null;
    bio: string | null;
  },
): AccountMemberPayload {
  const derived = deriveAcademicStatus({
    studyStatus: member.studyStatus,
    occupationType: member.occupationType,
    aboutSummary: member.aboutSummary,
  });
  const parsed = parseAboutSummary(member.aboutSummary);
  const academicStatus: ApiAcademicStatus | "" = derived || parsed.academicStatus || "";
  const sessionIntake = parsed.sessionIntake || "";

  return {
    memberCode: member.memberCode,
    nameBn: member.nameBn,
    phone: member.phone,
    academicStatus,
    universityName: member.universityKr,
    department: member.major,
    degree: normalizeDegree(member.degree),
    sessionIntake,
    cityKorea: member.locationCity,
    profilePhoto: member.imageUrl,
    studentIdImage: member.certifications,
    reasonToJoin: member.bio,
  };
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const memberRow = await prisma.communityMember.findFirst({
      where: { contactEmail: user.email },
    });

    const payload: AccountProfileResponse = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
      },
      member: memberRow ? memberToPayload(memberRow) : null,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Profile GET failed", error);
    return NextResponse.json({ error: "Could not load profile." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
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

    const parsed = patchBodySchema.safeParse(json);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        { error: first?.message || "Invalid profile data." },
        { status: 400 },
      );
    }

    const body = parsed.data;
    const name = body.name.trim() || null;
    const displayName = name || "";

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const existingMember = await prisma.communityMember.findFirst({
      where: { contactEmail: user.email },
      select: { id: true, imageUrl: true, activityNotes: true },
    });

    if (!body.profilePhoto && !existingMember?.imageUrl) {
      return NextResponse.json(
        { error: "Profile photo is required (upload an image or keep your existing one)." },
        { status: 400 },
      );
    }

    const emailNorm = user.email.trim().toLowerCase();
    const mapped = mapRegisterToMemberFields(body.academicStatus, body.sessionIntake);

    const memberData = {
      name: displayName || emailNorm.split("@")[0] || "Member",
      nameBn: body.nameBn?.trim() || null,
      contactEmail: emailNorm,
      phone: body.phone.trim(),
      universityKr: body.universityName.trim(),
      major: body.department.trim(),
      degree: body.degree,
      studyStatus: mapped.studyStatus,
      occupationType: mapped.occupationType,
      locationCity: body.cityKorea.trim(),
      imageUrl: (body.profilePhoto?.trim() || existingMember?.imageUrl) ?? null,
      certifications: body.studentIdImage?.trim() || null,
      bio: body.reasonToJoin?.trim() || null,
      aboutSummary: mapped.aboutSummary,
    };

    await prisma.user.update({
      where: { id: user.id },
      data: { name },
    });

    if (existingMember) {
      await prisma.communityMember.update({
        where: { id: existingMember.id },
        data: memberData,
      });
    } else {
      const memberCode = await createUniqueMemberCode();
      await prisma.communityMember.create({
        data: {
          ...memberData,
          memberCode,
          category: "CENTRAL_MEMBER",
          activityNotes: "Profile completed from account settings.",
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Profile PATCH failed", error);
    return NextResponse.json(
      { error: "Could not update profile right now. Please try again." },
      { status: 500 },
    );
  }
}
