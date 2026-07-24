import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";
import {
  clientIpFromRequest,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/rate-limit";
import { createUniqueMemberCode } from "@/lib/member-code";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000;
const REGISTER_LIMIT = 10;
const ACADEMIC_STATUSES = ["student", "graduate", "professional"] as const;
const ACADEMIC_DEGREES = ["Bachelor", "Masters", "PhD"] as const;

export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  const limited = rateLimit(`register:${ip}`, REGISTER_LIMIT, WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many registration attempts. Try again later." },
      { status: 429, headers: rateLimitHeaders(limited.retryAfterSec) },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const {
    fullNameEn,
    fullNameBn,
    email,
    phone,
    password,
    academicStatus,
    universityName,
    department,
    degree,
    sessionIntake,
    cityKorea,
    profilePhoto,
    studentIdImage,
    reasonToJoin,
  } = body as {
    fullNameEn?: string;
    fullNameBn?: string;
    email?: string;
    phone?: string;
    password?: string;
    academicStatus?: "student" | "graduate" | "professional";
    universityName?: string;
    department?: string;
    degree?: "Bachelor" | "Masters" | "PhD";
    sessionIntake?: string;
    cityKorea?: string;
    profilePhoto?: string | null;
    studentIdImage?: string | null;
    reasonToJoin?: string;
  };

  if (
    !fullNameEn?.trim() ||
    !email?.trim() ||
    !phone?.trim() ||
    !password ||
    password.length < 8 ||
    !academicStatus ||
    !universityName?.trim() ||
    !department?.trim() ||
    !degree ||
    !sessionIntake?.trim() ||
    !cityKorea?.trim() ||
    !profilePhoto
  ) {
    return NextResponse.json(
      { error: "Please fill all required fields." },
      { status: 400 },
    );
  }

  if (!ACADEMIC_STATUSES.includes(academicStatus)) {
    return NextResponse.json({ error: "Invalid academic status." }, { status: 400 });
  }

  if (!ACADEMIC_DEGREES.includes(degree)) {
    return NextResponse.json({ error: "Invalid degree." }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalized },
    });

    const hashed = await hash(password, 12);
    const mappedStudyStatus =
      academicStatus === "student"
        ? "CURRENT_STUDENT"
        : academicStatus === "graduate"
          ? "GRADUATED"
          : null;

    const mappedOccupationType = academicStatus === "professional" ? "JOB_HOLDER" : null;
    const memberCode = await createUniqueMemberCode();
    const communityMemberData = {
      memberCode,
      name: fullNameEn.trim(),
      nameBn: fullNameBn?.trim() || null,
      category: "CENTRAL_MEMBER",
      contactEmail: normalized,
      phone: phone.trim(),
      imageUrl: profilePhoto,
      universityKr: universityName.trim(),
      major: department.trim(),
      degree,
      studyStatus: mappedStudyStatus,
      occupationType: mappedOccupationType,
      locationCity: cityKorea.trim(),
      aboutSummary: `Status: ${academicStatus.toUpperCase()} | Session: ${sessionIntake.trim()}`,
      certifications: studentIdImage || null,
      bio: reasonToJoin?.trim() || null,
      activityNotes: "Registration submitted. Waiting for admin approval.",
    };

    // Recovery path: if a registration already exists but is still pending approval,
    // treat this as a resubmission and update the stored data.
    if (existingUser) {
      if (existingUser.emailVerified) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }

      const existingMember = await prisma.communityMember.findFirst({
        where: { contactEmail: normalized },
        select: { id: true },
      });

      if (existingMember) {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: existingUser.id },
            data: {
              password: hashed,
              name: fullNameEn.trim(),
            },
          }),
          prisma.communityMember.update({
            where: { id: existingMember.id },
            data: communityMemberData,
          }),
        ]);

        return NextResponse.json({
          ok: true,
          message:
            "Registration already exists and is pending admin approval. Your latest details were updated.",
        });
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id: existingUser.id },
          data: {
            password: hashed,
            name: fullNameEn.trim(),
          },
        }),
        prisma.communityMember.create({
          data: communityMemberData,
        }),
      ]);

      return NextResponse.json({
        ok: true,
        message:
          "Registration already exists and is pending admin approval. Missing profile details were added.",
      });
    }

    await prisma.$transaction([
      prisma.user.create({
        data: {
          email: normalized,
          password: hashed,
          name: fullNameEn.trim(),
          role: "USER",
          // Remains null by default; admin approval sets this to mark active.
          emailVerified: null,
        },
      }),
      prisma.communityMember.create({
        data: communityMemberData,
      }),
    ]);

    return NextResponse.json({
      ok: true,
      message: "Registration submitted. Your account is pending admin approval.",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = error.meta?.target;
      const targetValue = Array.isArray(target) ? target.join(",") : String(target ?? "");

      if (targetValue.includes("User_email_key")) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }
    }

    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}
