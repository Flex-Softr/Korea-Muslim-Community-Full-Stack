/** Stored as strings in SQLite (Prisma has no native enums for SQLite). */

export const PROFILE_VISIBILITIES = ["PUBLIC", "MEMBERS_ONLY"] as const;
export type ProfileVisibility = (typeof PROFILE_VISIBILITIES)[number];

export const MEMBER_GENDERS = [
  "MALE",
  "FEMALE",
  "OTHER",
  "PREFER_NOT_TO_SAY",
] as const;
export type MemberGender = (typeof MEMBER_GENDERS)[number];

export const STUDY_STATUSES = ["CURRENT_STUDENT", "GRADUATED"] as const;
export type StudyStatus = (typeof STUDY_STATUSES)[number];

export const OCCUPATION_TYPES = [
  "STUDENT",
  "JOB_HOLDER",
  "BUSINESS_OWNER",
  "OTHER",
] as const;
export type OccupationType = (typeof OCCUPATION_TYPES)[number];

export function parseProfileVisibility(raw: string): ProfileVisibility {
  return raw === "MEMBERS_ONLY" ? "MEMBERS_ONLY" : "PUBLIC";
}

/** Contact, Korea journey, and date of birth respect this. */
export function canViewRestrictedProfile(
  visibility: string,
  isLoggedIn: boolean,
): boolean {
  const v = parseProfileVisibility(visibility);
  if (v === "PUBLIC") {
    return true;
  }
  return isLoggedIn;
}

export const GENDER_LABELS: Record<MemberGender, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Prefer not to say",
};

export const STUDY_STATUS_LABELS: Record<StudyStatus, string> = {
  CURRENT_STUDENT: "Current student",
  GRADUATED: "Graduated",
};

export const OCCUPATION_LABELS: Record<OccupationType, string> = {
  STUDENT: "Student",
  JOB_HOLDER: "Job holder",
  BUSINESS_OWNER: "Business owner",
  OTHER: "Other",
};

export const PROFILE_VISIBILITY_LABELS: Record<ProfileVisibility, string> = {
  PUBLIC: "Public — anyone can see contact & journey",
  MEMBERS_ONLY: "Members only — sign-in required for contact & journey",
};

function isMemberGender(v: string): v is MemberGender {
  return (MEMBER_GENDERS as readonly string[]).includes(v);
}

function isStudyStatus(v: string): v is StudyStatus {
  return (STUDY_STATUSES as readonly string[]).includes(v);
}

function isOccupationType(v: string): v is OccupationType {
  return (OCCUPATION_TYPES as readonly string[]).includes(v);
}

export function formatGender(value: string | null | undefined): string | null {
  if (!value || !isMemberGender(value)) {
    return null;
  }
  return GENDER_LABELS[value];
}

export function formatStudyStatus(
  value: string | null | undefined,
): string | null {
  if (!value || !isStudyStatus(value)) {
    return null;
  }
  return STUDY_STATUS_LABELS[value];
}

export function formatOccupationType(
  value: string | null | undefined,
): string | null {
  if (!value || !isOccupationType(value)) {
    return null;
  }
  return OCCUPATION_LABELS[value];
}
