import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  isMemberCategory,
  SLUG_CATEGORY_FILTERS,
  type MemberCategory,
  type MemberSlug,
} from "@/lib/members/config";

/** Safe for client-boundary listing (no contact / journey / DOB). */
export type CommunityMemberListDTO = {
  id: string;
  name: string;
  nameBn: string | null;
  title: string | null;
  designation: string | null;
  aboutSummary: string | null;
  bio: string | null;
  imageUrl: string | null;
  sortOrder: number;
  category: string;
  universityKr: string | null;
  locationCity: string | null;
  homeDivisionBd: string | null;
  homeDistrictBd: string | null;
  degree: string | null;
  major: string | null;
  studyStatus: string | null;
  yearAdmission: number | null;
  graduationYear: number | null;
  occupationType: string | null;
  companyName: string | null;
  jobTitle: string | null;
};

export type CommunityMemberProfileDTO = CommunityMemberListDTO & {
  memberCode: string | null;
  gender: string | null;
  dateOfBirth: Date | null;
  dateOfBirthYearOnly: boolean;
  profileVisibility: string;
  contactEmail: string | null;
  phone: string | null;
  whatsApp: string | null;
  kakaoId: string | null;
  linkedInUrl: string | null;
  facebookUrl: string | null;
  yearArrivalKorea: number | null;
  visaType: string | null;
  scholarshipInfo: string | null;
  educationBangladesh: string | null;
  skillsTechnical: string | null;
  koreanLevelTopik: string | null;
  certifications: string | null;
  awards: string | null;
  publications: string | null;
  researchPapers: string | null;
  scholarshipsHonors: string | null;
  activityPostsCount: number | null;
  activityCommentsCount: number | null;
  activityEventsCount: number | null;
  activityNotes: string | null;
};

function mapListRow(m: {
  id: string;
  name: string;
  nameBn: string | null;
  title: string | null;
  designation: string | null;
  aboutSummary: string | null;
  bio: string | null;
  imageUrl: string | null;
  sortOrder: number;
  category: string;
  universityKr: string | null;
  locationCity: string | null;
  homeDivisionBd: string | null;
  homeDistrictBd: string | null;
  degree: string | null;
  major: string | null;
  studyStatus: string | null;
  yearAdmission: number | null;
  graduationYear: number | null;
  occupationType: string | null;
  companyName: string | null;
  jobTitle: string | null;
}): CommunityMemberListDTO {
  return {
    id: m.id,
    name: m.name,
    nameBn: m.nameBn,
    title: m.title,
    designation: m.designation,
    aboutSummary: m.aboutSummary,
    bio: m.bio,
    imageUrl: m.imageUrl,
    sortOrder: m.sortOrder,
    category: m.category,
    universityKr: m.universityKr,
    locationCity: m.locationCity,
    homeDivisionBd: m.homeDivisionBd,
    homeDistrictBd: m.homeDistrictBd,
    degree: m.degree,
    major: m.major,
    studyStatus: m.studyStatus,
    yearAdmission: m.yearAdmission,
    graduationYear: m.graduationYear,
    occupationType: m.occupationType,
    companyName: m.companyName,
    jobTitle: m.jobTitle,
  };
}

type CommunityMemberRow = NonNullable<
  Awaited<ReturnType<typeof prisma.communityMember.findUnique>>
>;

function mapProfileRow(m: CommunityMemberRow): CommunityMemberProfileDTO {
  return {
    ...mapListRow(m),
    memberCode: m.memberCode,
    gender: m.gender,
    dateOfBirth: m.dateOfBirth,
    dateOfBirthYearOnly: m.dateOfBirthYearOnly,
    profileVisibility: m.profileVisibility,
    contactEmail: m.contactEmail,
    phone: m.phone,
    whatsApp: m.whatsApp,
    kakaoId: m.kakaoId,
    linkedInUrl: m.linkedInUrl,
    facebookUrl: m.facebookUrl,
    yearArrivalKorea: m.yearArrivalKorea,
    visaType: m.visaType,
    scholarshipInfo: m.scholarshipInfo,
    educationBangladesh: m.educationBangladesh,
    skillsTechnical: m.skillsTechnical,
    koreanLevelTopik: m.koreanLevelTopik,
    certifications: m.certifications,
    awards: m.awards,
    publications: m.publications,
    researchPapers: m.researchPapers,
    scholarshipsHonors: m.scholarshipsHonors,
    activityPostsCount: m.activityPostsCount,
    activityCommentsCount: m.activityCommentsCount,
    activityEventsCount: m.activityEventsCount,
    activityNotes: m.activityNotes,
  };
}

export async function getMembersByCategory(
  categoryOrSlug: MemberCategory | MemberSlug,
  filters?: {
    homeDivisionBd?: string | null;
    homeDistrictBd?: string | null;
  },
): Promise<CommunityMemberListDTO[]> {
  const categories =
    categoryOrSlug in SLUG_CATEGORY_FILTERS
      ? SLUG_CATEGORY_FILTERS[categoryOrSlug as MemberSlug]
      : [categoryOrSlug as MemberCategory];

  const where: Prisma.CommunityMemberWhereInput = {
    category: { in: categories },
  };
  if (filters?.homeDivisionBd) {
    where.homeDivisionBd = filters.homeDivisionBd;
  }
  if (filters?.homeDistrictBd) {
    where.homeDistrictBd = filters.homeDistrictBd;
  }

  const rows = await prisma.communityMember.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      nameBn: true,
      title: true,
      designation: true,
      aboutSummary: true,
      bio: true,
      imageUrl: true,
      sortOrder: true,
      category: true,
      universityKr: true,
      locationCity: true,
      homeDivisionBd: true,
      homeDistrictBd: true,
      degree: true,
      major: true,
      studyStatus: true,
      yearAdmission: true,
      graduationYear: true,
      occupationType: true,
      companyName: true,
      jobTitle: true,
    },
  });
  return rows.map(mapListRow);
}

export async function getMemberById(
  id: string,
): Promise<CommunityMemberProfileDTO | null> {
  const row = await prisma.communityMember.findUnique({
    where: { id },
  });
  if (!row || !isMemberCategory(row.category)) {
    return null;
  }
  return mapProfileRow(row);
}
