import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import {
  clientIpFromRequest,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000;
const REGISTER_LIMIT = 5;

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

  const normalized = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: normalized },
  });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const hashed = await hash(password, 12);
  const mappedStudyStatus =
    academicStatus === "student"
      ? "CURRENT_STUDENT"
      : academicStatus === "graduate"
        ? "GRADUATED"
        : null;

  const mappedOccupationType = academicStatus === "professional" ? "JOB_HOLDER" : null;

  const user = await prisma.user.create({
    data: {
      email: normalized,
      password: hashed,
      name: fullNameEn.trim(),
      role: "USER",
      // Remains null by default; admin approval sets this to mark active.
      emailVerified: null,
    },
  });

  await prisma.communityMember.create({
    data: {
      name: fullNameEn.trim(),
      nameBn: fullNameBn?.trim() || null,
      category: "GENERAL",
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
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Registration submitted. Your account is pending admin approval.",
  });
}
