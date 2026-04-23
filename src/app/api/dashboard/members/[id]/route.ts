import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isMemberCategory } from "@/lib/members/config";
import { hasMinimumRole } from "@/lib/roles";

async function ensureAdmin() {
  const session = await auth();
  return !!session?.user?.id && hasMinimumRole(session.user.role, "ADMIN");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const member = await prisma.communityMember.findUnique({
    where: { id },
    select: {
      id: true,
      memberCode: true,
      name: true,
      designation: true,
      nameBn: true,
      title: true,
      category: true,
      profileVisibility: true,
      contactEmail: true,
      sortOrder: true,
      aboutSummary: true,
      bio: true,
      imageUrl: true,
      gender: true,
      dateOfBirth: true,
      dateOfBirthYearOnly: true,
      universityKr: true,
      degree: true,
      major: true,
      studyStatus: true,
      yearAdmission: true,
      graduationYear: true,
      locationCity: true,
      homeDivisionBd: true,
      homeDistrictBd: true,
      occupationType: true,
      companyName: true,
      jobTitle: true,
      phone: true,
      whatsApp: true,
      kakaoId: true,
      linkedInUrl: true,
      facebookUrl: true,
      yearArrivalKorea: true,
      visaType: true,
      scholarshipInfo: true,
      educationBangladesh: true,
      skillsTechnical: true,
      koreanLevelTopik: true,
      certifications: true,
      awards: true,
      publications: true,
      researchPapers: true,
      scholarshipsHonors: true,
      activityNotes: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }
  return NextResponse.json(member);
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
    name?: string;
    memberCode?: string | null;
    designation?: string | null;
    title?: string | null;
    category?: string;
    profileVisibility?: string;
    contactEmail?: string | null;
    sortOrder?: number;
    nameBn?: string | null;
    aboutSummary?: string | null;
    bio?: string | null;
    imageUrl?: string | null;
    gender?: string | null;
    dateOfBirth?: string | null;
    dateOfBirthYearOnly?: boolean;
    universityKr?: string | null;
    degree?: string | null;
    major?: string | null;
    studyStatus?: string | null;
    yearAdmission?: string | number | null;
    graduationYear?: string | number | null;
    locationCity?: string | null;
    homeDivisionBd?: string | null;
    homeDistrictBd?: string | null;
    occupationType?: string | null;
    companyName?: string | null;
    jobTitle?: string | null;
    phone?: string | null;
    whatsApp?: string | null;
    kakaoId?: string | null;
    linkedInUrl?: string | null;
    facebookUrl?: string | null;
    yearArrivalKorea?: string | number | null;
    visaType?: string | null;
    scholarshipInfo?: string | null;
    educationBangladesh?: string | null;
    skillsTechnical?: string | null;
    koreanLevelTopik?: string | null;
    certifications?: string | null;
    awards?: string | null;
    publications?: string | null;
    researchPapers?: string | null;
    scholarshipsHonors?: string | null;
    activityNotes?: string | null;
  };

  const parseOptionalInt = (value: string | number | null | undefined): number | null => {
    if (value === undefined || value === null || value === "") return null;
    const num = Number(value);
    return Number.isFinite(num) ? Math.trunc(num) : null;
  };

  const data: Record<string, unknown> = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json({ error: "Member name is required." }, { status: 400 });
    }
    data.name = name;
  }

  if (body.memberCode !== undefined) {
    data.memberCode = body.memberCode?.trim() || null;
  }
  if (body.title !== undefined) {
    data.title = body.title?.trim() || null;
  }
  if (body.designation !== undefined) {
    data.designation = body.designation?.trim() || null;
  }
  if (body.contactEmail !== undefined) {
    data.contactEmail = body.contactEmail?.trim() || null;
  }
  if (body.category !== undefined) {
    const category = body.category.trim().toUpperCase();
    if (!isMemberCategory(category)) {
      return NextResponse.json({ error: "Invalid member category." }, { status: 400 });
    }
    data.category = category;
  }
  if (body.profileVisibility !== undefined) {
    const visibility = body.profileVisibility.trim().toUpperCase();
    if (visibility !== "PUBLIC" && visibility !== "MEMBERS_ONLY") {
      return NextResponse.json({ error: "Invalid profile visibility." }, { status: 400 });
    }
    data.profileVisibility = visibility;
  }
  if (body.sortOrder !== undefined) {
    if (!Number.isFinite(body.sortOrder)) {
      return NextResponse.json({ error: "Invalid sort order." }, { status: 400 });
    }
    data.sortOrder = Number(body.sortOrder);
  }
  if (body.nameBn !== undefined) data.nameBn = body.nameBn?.trim() || null;
  if (body.aboutSummary !== undefined) data.aboutSummary = body.aboutSummary?.trim() || null;
  if (body.bio !== undefined) data.bio = body.bio?.trim() || null;
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl?.trim() || null;
  if (body.gender !== undefined) data.gender = body.gender?.trim() || null;
  if (body.dateOfBirth !== undefined) {
    if (!body.dateOfBirth) {
      data.dateOfBirth = null;
    } else {
      const parsedDate = new Date(body.dateOfBirth);
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json({ error: "Invalid date of birth." }, { status: 400 });
      }
      data.dateOfBirth = parsedDate;
    }
  }
  if (body.dateOfBirthYearOnly !== undefined) data.dateOfBirthYearOnly = body.dateOfBirthYearOnly === true;
  if (body.universityKr !== undefined) data.universityKr = body.universityKr?.trim() || null;
  if (body.degree !== undefined) data.degree = body.degree?.trim() || null;
  if (body.major !== undefined) data.major = body.major?.trim() || null;
  if (body.studyStatus !== undefined) data.studyStatus = body.studyStatus?.trim() || null;
  if (body.yearAdmission !== undefined) data.yearAdmission = parseOptionalInt(body.yearAdmission);
  if (body.graduationYear !== undefined) data.graduationYear = parseOptionalInt(body.graduationYear);
  if (body.locationCity !== undefined) data.locationCity = body.locationCity?.trim() || null;
  if (body.homeDivisionBd !== undefined) data.homeDivisionBd = body.homeDivisionBd?.trim() || null;
  if (body.homeDistrictBd !== undefined) data.homeDistrictBd = body.homeDistrictBd?.trim() || null;
  if (body.occupationType !== undefined) data.occupationType = body.occupationType?.trim() || null;
  if (body.companyName !== undefined) data.companyName = body.companyName?.trim() || null;
  if (body.jobTitle !== undefined) data.jobTitle = body.jobTitle?.trim() || null;
  if (body.phone !== undefined) data.phone = body.phone?.trim() || null;
  if (body.whatsApp !== undefined) data.whatsApp = body.whatsApp?.trim() || null;
  if (body.kakaoId !== undefined) data.kakaoId = body.kakaoId?.trim() || null;
  if (body.linkedInUrl !== undefined) data.linkedInUrl = body.linkedInUrl?.trim() || null;
  if (body.facebookUrl !== undefined) data.facebookUrl = body.facebookUrl?.trim() || null;
  if (body.yearArrivalKorea !== undefined) data.yearArrivalKorea = parseOptionalInt(body.yearArrivalKorea);
  if (body.visaType !== undefined) data.visaType = body.visaType?.trim() || null;
  if (body.scholarshipInfo !== undefined) data.scholarshipInfo = body.scholarshipInfo?.trim() || null;
  if (body.educationBangladesh !== undefined) data.educationBangladesh = body.educationBangladesh?.trim() || null;
  if (body.skillsTechnical !== undefined) data.skillsTechnical = body.skillsTechnical?.trim() || null;
  if (body.koreanLevelTopik !== undefined) data.koreanLevelTopik = body.koreanLevelTopik?.trim() || null;
  if (body.certifications !== undefined) data.certifications = body.certifications?.trim() || null;
  if (body.awards !== undefined) data.awards = body.awards?.trim() || null;
  if (body.publications !== undefined) data.publications = body.publications?.trim() || null;
  if (body.researchPapers !== undefined) data.researchPapers = body.researchPapers?.trim() || null;
  if (body.scholarshipsHonors !== undefined) data.scholarshipsHonors = body.scholarshipsHonors?.trim() || null;
  if (body.activityNotes !== undefined) data.activityNotes = body.activityNotes?.trim() || null;

  try {
    const updated = await prisma.communityMember.update({
      where: { id },
      data,
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
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Could not update member." }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.communityMember.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Member not found." }, { status: 404 });
  }
}
