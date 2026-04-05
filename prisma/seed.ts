import { Prisma, PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { loadServerEnv } from "../src/config/load-server-env";
import { MEMBER_CATEGORY } from "../src/lib/members/config";
import { isUserRole, type UserRole } from "../src/lib/roles";

const prisma = new PrismaClient();

const SAMPLE_MEMBERS = [
  {
    memberCode: "BA-2024-001",
    name: "Yusuf Rahman",
    nameBn: "ইউসুফ রহমান",
    title: "President",
    aboutSummary:
      "Focused on strengthening our Bangladeshi alumni network in Korea and helping new students settle in Seoul.",
    bio: "Coordinates programmes and external relations for the Bangladeshi alumni community in Korea.\n\nPreviously helped launch cross-city meetups and the winter care programme.",
    sortOrder: 0,
    category: MEMBER_CATEGORY.EXECUTIVE,
    imageUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
    gender: "MALE",
    dateOfBirth: new Date("1990-05-12T00:00:00.000Z"),
    dateOfBirthYearOnly: false,
    universityKr: "Seoul National University",
    degree: "Masters",
    major: "Public administration",
    studyStatus: "GRADUATED",
    yearAdmission: 2015,
    graduationYear: 2017,
    locationCity: "Seoul",
    homeDivisionBd: "Dhaka",
    homeDistrictBd: "Dhaka",
    occupationType: "JOB_HOLDER",
    companyName: "Korea Muslim Community",
    jobTitle: "Association president",
    profileVisibility: "PUBLIC",
    contactEmail: "yusuf.rahman@example.org",
    phone: "+82 10-0000-0001",
    whatsApp: "+821000000001",
    kakaoId: "yusuf.kr",
    yearArrivalKorea: 2015,
    visaType: "D-2 (student), later E-7",
    scholarshipInfo: "Government scholarship pathway — happy to share tips with applicants.",
    educationBangladesh:
      "BSS, University of Dhaka (International relations).\n\nCompleted undergraduate before moving to Korea.",
    skillsTechnical: "Event management, public speaking, grant writing",
    koreanLevelTopik: "TOPIK Level 5",
    certifications: "Project management (online)",
    awards: "KMC Service Award — 2024",
    scholarshipsHonors:
      "Internal recognition for leadership in member onboarding (2023).",
    activityPostsCount: 14,
    activityCommentsCount: 42,
    activityEventsCount: 9,
    activityNotes:
      "Volunteer lead for winter distribution 2024–2025.\nHosts monthly online Q&A for new arrivals.",
  },
  {
    memberCode: "BA-2024-002",
    name: "Aisha Khan",
    nameBn: "আয়েশা খান",
    title: "Secretary",
    aboutSummary:
      "Keeps the association organised — from records to newsletters — and welcomes new members.",
    bio: "Oversees records, communications, and member onboarding.",
    sortOrder: 1,
    category: MEMBER_CATEGORY.EXECUTIVE,
    imageUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    gender: "FEMALE",
    universityKr: "Yonsei University",
    degree: "Masters",
    major: "Business administration",
    studyStatus: "GRADUATED",
    yearAdmission: 2016,
    graduationYear: 2018,
    locationCity: "Incheon",
    homeDivisionBd: "Dhaka",
    homeDistrictBd: "Dhaka",
    occupationType: "JOB_HOLDER",
    companyName: "Regional logistics firm",
    jobTitle: "Operations specialist",
    profileVisibility: "MEMBERS_ONLY",
    contactEmail: "aisha.khan@example.org",
    phone: "+82 10-0000-0002",
    kakaoId: "aisha_yonsei",
    yearArrivalKorea: 2016,
    visaType: "D-2",
    scholarshipInfo: "Self-funded; part-time campus work during studies.",
    educationBangladesh: "BBA, North South University.",
    skillsTechnical: "Excel, community CRM tools",
    koreanLevelTopik: "TOPIK Level 4",
  },
  {
    memberCode: "BA-2024-010",
    name: "Dr. Ibrahim Hassan",
    nameBn: "ড. ইব্রাহিম হাসান",
    title: "Senior advisor",
    aboutSummary:
      "Scholar of religious education; supports the association on ethics, curriculum, and family programmes.",
    bio: "Islamic studies scholar; advises on education and ethics.",
    sortOrder: 0,
    category: MEMBER_CATEGORY.ADVISOR_BODY,
    imageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
    gender: "MALE",
    universityKr: "Korea University",
    degree: "PhD",
    major: "Religious studies",
    studyStatus: "GRADUATED",
    yearAdmission: 2010,
    graduationYear: 2016,
    locationCity: "Seoul",
    homeDivisionBd: "Khulna",
    homeDistrictBd: "Kushtia",
    occupationType: "JOB_HOLDER",
    companyName: "Research institute",
    jobTitle: "Research fellow",
    profileVisibility: "PUBLIC",
    contactEmail: "ibrahim.hassan@example.org",
    linkedInUrl: "https://www.linkedin.com/in/example-ibrahim",
    yearArrivalKorea: 2010,
    visaType: "D-2",
    educationBangladesh:
      "MA Islamic studies, Islamic University, Kushtia.",
    skillsTechnical: "Curriculum design, translation (BN/EN/AR)",
    koreanLevelTopik: "TOPIK Level 6",
    publications:
      "Chapter in *Muslim Communities in Northeast Asia* (2022).\nArticle: Rahma Journal (2023) — faith and student civic life.",
    researchPapers:
      "Working paper: articulation between madrasa pathways and Korean higher ed (under review).",
    scholarshipsHonors: "Korea University doctoral fellowship (2012–2016)",
  },
  {
    memberCode: "BA-2024-011",
    name: "Maryam Siddiqui",
    nameBn: "মারয়াম সিদ্দিকী",
    title: "Community advisor",
    bio: "Supports family services and women’s programmes.",
    sortOrder: 1,
    category: MEMBER_CATEGORY.ADVISOR_BODY,
    imageUrl: null,
    gender: "FEMALE",
    universityKr: "Ewha Womans University",
    degree: "Masters",
    major: "Social welfare",
    studyStatus: "GRADUATED",
    locationCity: "Busan",
    homeDivisionBd: "Chattogram",
    homeDistrictBd: "Chattogram",
    occupationType: "BUSINESS_OWNER",
    companyName: "Small language studio",
    jobTitle: "Founder",
    profileVisibility: "PUBLIC",
    contactEmail: "maryam.s@example.org",
    yearArrivalKorea: 2012,
    visaType: "F-6",
    educationBangladesh: "BSS, University of Chittagong.",
    koreanLevelTopik: "TOPIK Level 5",
  },
  {
    memberCode: "BA-2024-020",
    name: "Omar Farouk",
    nameBn: "ওমর ফারুক",
    title: "Volunteer coordinator",
    aboutSummary:
      "Engineering student in Seoul. Loves helping new Bangladeshi students with housing tips and campus life.",
    bio: "Organises weekend events and mosque shuttles in Seoul.",
    sortOrder: 0,
    category: MEMBER_CATEGORY.GENERAL,
    imageUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
    gender: "MALE",
    universityKr: "Hanyang University",
    degree: "Bachelor",
    major: "Mechanical engineering",
    studyStatus: "CURRENT_STUDENT",
    yearAdmission: 2022,
    locationCity: "Seoul",
    homeDivisionBd: "Dhaka",
    homeDistrictBd: "Dhaka",
    occupationType: "STUDENT",
    profileVisibility: "PUBLIC",
    contactEmail: "omar.f@example.org",
    kakaoId: "omar_hanyang",
    yearArrivalKorea: 2022,
    visaType: "D-2",
    scholarshipInfo: "GKS/KGSP — ask me about the timeline and documents.",
    educationBangladesh:
      "HSC + one year engineering foundation, Dhaka.",
    skillsTechnical: "CAD basics, volunteer driving roster",
    koreanLevelTopik: "TOPIK Level 3 (studying for 4)",
    activityPostsCount: 6,
    activityCommentsCount: 18,
    activityEventsCount: 4,
    activityNotes: "Regular volunteer at community sports days and Friday shuttles.",
  },
  {
    memberCode: "BA-2024-021",
    name: "Fatima Noor",
    nameBn: "ফাতিমা নূর",
    title: "Youth mentor",
    aboutSummary:
      "CS graduate student mentoring peers in coding basics and life in Daejeon.",
    bio: "Runs study sessions and peer support for students.",
    sortOrder: 1,
    category: MEMBER_CATEGORY.GENERAL,
    imageUrl: null,
    gender: "FEMALE",
    universityKr: "KAIST",
    degree: "Masters",
    major: "Computer science",
    studyStatus: "CURRENT_STUDENT",
    yearAdmission: 2023,
    locationCity: "Daejeon",
    homeDivisionBd: "Dhaka",
    homeDistrictBd: "Dhaka",
    occupationType: "STUDENT",
    profileVisibility: "MEMBERS_ONLY",
    contactEmail: "fatima.n@example.org",
    yearArrivalKorea: 2023,
    visaType: "D-2",
    scholarshipInfo: "University TA + small stipend.",
    educationBangladesh: "BSc CSE, BUET.",
    skillsTechnical: "Python, web basics, peer tutoring",
    koreanLevelTopik: "TOPIK Level 4",
  },
] satisfies Prisma.CommunityMemberCreateManyInput[];

async function main() {
  const memberCount = await prisma.communityMember.count();
  if (memberCount > 0) {
    console.info(
      `[seed] Skipped community members (${memberCount} row(s) already present)`,
    );
  } else {
    await prisma.communityMember.createMany({ data: SAMPLE_MEMBERS });
    console.info("[seed] Seeded community members (executive, advisor, general)");
  }

  const env = loadServerEnv();
  const email = env.SEED_USER_EMAIL;
  const password = env.SEED_USER_PASSWORD;
  const name = env.SEED_USER_NAME;
  const rawRole = env.SEED_USER_ROLE;
  const role: UserRole =
    rawRole && isUserRole(rawRole) ? rawRole : "ADMIN";

  if (!email || !password) {
    console.info(
      "[seed] Skipped default user: set SEED_USER_EMAIL and SEED_USER_PASSWORD in .env, then run npm run db:seed",
    );
    return;
  }

  const normalized = email.trim().toLowerCase();
  const hashed = await hash(password, 12);

  const update: Prisma.UserUpdateInput = {
    password: hashed,
    role,
  };
  if (name?.trim()) {
    update.name = name.trim();
  }

  const verifiedAt = new Date();

  await prisma.user.upsert({
    where: { email: normalized },
    create: {
      email: normalized,
      password: hashed,
      name: name?.trim() || "Seeded user",
      role,
      emailVerified: verifiedAt,
    },
    update: { ...update, emailVerified: verifiedAt },
  });

  console.info(`[seed] Upserted user: ${normalized} (${role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
