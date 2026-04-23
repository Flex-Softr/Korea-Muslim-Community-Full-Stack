import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasMinimumRole } from "@/lib/roles";
import { isMemberCategory } from "@/lib/members/config";

const DEFAULT_PAGE_SIZE = 10;

function toPositiveInt(raw: string | null, fallback: number): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return parsed;
}

async function ensureAdmin() {
  const session = await auth();
  return !!session?.user?.id && hasMinimumRole(session.user.role, "ADMIN");
}

export async function GET(request: Request) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = toPositiveInt(searchParams.get("page"), 1);
  const pageSize = toPositiveInt(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE);
  const search = (searchParams.get("search") ?? "").trim();
  const category = (searchParams.get("category") ?? "").trim().toUpperCase();
  const profileVisibility = (searchParams.get("profileVisibility") ?? "").trim().toUpperCase();

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { designation: { contains: search } },
            { title: { contains: search } },
            { contactEmail: { contains: search } },
            { memberCode: { contains: search } },
          ],
        }
      : {}),
    ...(isMemberCategory(category) ? { category } : {}),
    ...(profileVisibility === "PUBLIC" || profileVisibility === "MEMBERS_ONLY"
      ? { profileVisibility }
      : {}),
  };

  const [totalItems, items] = await Promise.all([
    prisma.communityMember.count({ where }),
    prisma.communityMember.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        memberCode: true,
        name: true,
        designation: true,
        title: true,
        category: true,
        profileVisibility: true,
        contactEmail: true,
        sortOrder: true,
        createdAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  return NextResponse.json({
    items,
    pagination: {
      page: Math.min(page, totalPages),
      pageSize,
      totalItems,
      totalPages,
    },
  });
}

export async function POST(request: Request) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    name?: string;
    memberCode?: string;
    designation?: string;
    title?: string;
    category?: string;
    profileVisibility?: string;
    contactEmail?: string;
    sortOrder?: number;
    nameBn?: string;
    aboutSummary?: string;
    bio?: string;
    imageUrl?: string;
    gender?: string;
    dateOfBirth?: string;
    dateOfBirthYearOnly?: boolean;
    universityKr?: string;
    degree?: string;
    major?: string;
    studyStatus?: string;
    yearAdmission?: string | number;
    graduationYear?: string | number;
    locationCity?: string;
    homeDivisionBd?: string;
    homeDistrictBd?: string;
    occupationType?: string;
    companyName?: string;
    jobTitle?: string;
    phone?: string;
    whatsApp?: string;
    kakaoId?: string;
    linkedInUrl?: string;
    facebookUrl?: string;
    yearArrivalKorea?: string | number;
    visaType?: string;
    scholarshipInfo?: string;
    educationBangladesh?: string;
    skillsTechnical?: string;
    koreanLevelTopik?: string;
    certifications?: string;
    awards?: string;
    publications?: string;
    researchPapers?: string;
    scholarshipsHonors?: string;
    activityNotes?: string;
  };

  const name = body.name?.trim() ?? "";
  const memberCode = body.memberCode?.trim() || null;
  const designation = body.designation?.trim() || null;
  const title = body.title?.trim() || null;
  const category = (body.category ?? "").trim().toUpperCase();
  const profileVisibility = (body.profileVisibility ?? "PUBLIC").trim().toUpperCase();
  const contactEmail = body.contactEmail?.trim() || null;
  const sortOrder = Number.isFinite(body.sortOrder) ? Number(body.sortOrder) : 0;
  const dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
  const parseOptionalInt = (value: string | number | undefined): number | null => {
    if (value === undefined || value === null || value === "") return null;
    const num = Number(value);
    return Number.isFinite(num) ? Math.trunc(num) : null;
  };

  if (!name) {
    return NextResponse.json({ error: "Member name is required." }, { status: 400 });
  }
  if (!isMemberCategory(category)) {
    return NextResponse.json({ error: "Invalid member category." }, { status: 400 });
  }
  if (profileVisibility !== "PUBLIC" && profileVisibility !== "MEMBERS_ONLY") {
    return NextResponse.json({ error: "Invalid profile visibility." }, { status: 400 });
  }
  if (dateOfBirth && Number.isNaN(dateOfBirth.getTime())) {
    return NextResponse.json({ error: "Invalid date of birth." }, { status: 400 });
  }

  try {
    const created = await prisma.communityMember.create({
      data: {
        name,
        memberCode,
        designation,
        title,
        category,
        profileVisibility,
        contactEmail,
        sortOrder,
        nameBn: body.nameBn?.trim() || null,
        aboutSummary: body.aboutSummary?.trim() || null,
        bio: body.bio?.trim() || null,
        imageUrl: body.imageUrl?.trim() || null,
        gender: body.gender?.trim() || null,
        dateOfBirth,
        dateOfBirthYearOnly: body.dateOfBirthYearOnly === true,
        universityKr: body.universityKr?.trim() || null,
        degree: body.degree?.trim() || null,
        major: body.major?.trim() || null,
        studyStatus: body.studyStatus?.trim() || null,
        yearAdmission: parseOptionalInt(body.yearAdmission),
        graduationYear: parseOptionalInt(body.graduationYear),
        locationCity: body.locationCity?.trim() || null,
        homeDivisionBd: body.homeDivisionBd?.trim() || null,
        homeDistrictBd: body.homeDistrictBd?.trim() || null,
        occupationType: body.occupationType?.trim() || null,
        companyName: body.companyName?.trim() || null,
        jobTitle: body.jobTitle?.trim() || null,
        phone: body.phone?.trim() || null,
        whatsApp: body.whatsApp?.trim() || null,
        kakaoId: body.kakaoId?.trim() || null,
        linkedInUrl: body.linkedInUrl?.trim() || null,
        facebookUrl: body.facebookUrl?.trim() || null,
        yearArrivalKorea: parseOptionalInt(body.yearArrivalKorea),
        visaType: body.visaType?.trim() || null,
        scholarshipInfo: body.scholarshipInfo?.trim() || null,
        educationBangladesh: body.educationBangladesh?.trim() || null,
        skillsTechnical: body.skillsTechnical?.trim() || null,
        koreanLevelTopik: body.koreanLevelTopik?.trim() || null,
        certifications: body.certifications?.trim() || null,
        awards: body.awards?.trim() || null,
        publications: body.publications?.trim() || null,
        researchPapers: body.researchPapers?.trim() || null,
        scholarshipsHonors: body.scholarshipsHonors?.trim() || null,
        activityNotes: body.activityNotes?.trim() || null,
      },
      select: {
        id: true,
        memberCode: true,
        name: true,
        designation: true,
        title: true,
        category: true,
        profileVisibility: true,
        contactEmail: true,
        sortOrder: true,
        createdAt: true,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not create member. Member code may already exist." },
      { status: 400 },
    );
  }
}
