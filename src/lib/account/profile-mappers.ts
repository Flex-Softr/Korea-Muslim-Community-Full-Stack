export const ACADEMIC_STATUSES = ["student", "graduate", "professional"] as const;
export type ApiAcademicStatus = (typeof ACADEMIC_STATUSES)[number];

const ABOUT_SUMMARY_RE = /^Status:\s*(\w+)\s*\|\s*Session:\s*([^\n\r]+)/i;

/**
 * Kept in sync with `POST /api/register` (communityMember.aboutSummary).
 */
export function buildAboutSummary(
  academicStatus: ApiAcademicStatus,
  sessionIntake: string,
): string {
  return `Status: ${academicStatus.toUpperCase()} | Session: ${sessionIntake.trim()}`;
}

export function parseAboutSummary(about: string | null | undefined): {
  academicStatus: ApiAcademicStatus | null;
  sessionIntake: string;
} {
  if (!about?.trim()) {
    return { academicStatus: null, sessionIntake: "" };
  }
  const m = about.trim().match(ABOUT_SUMMARY_RE);
  if (!m) {
    return { academicStatus: null, sessionIntake: "" };
  }
  const key = m[1].toLowerCase();
  if (key === "student" || key === "graduate" || key === "professional") {
    return { academicStatus: key, sessionIntake: m[2].trim() };
  }
  return { academicStatus: null, sessionIntake: "" };
}

export function deriveAcademicStatus(m: {
  studyStatus: string | null;
  occupationType: string | null;
  aboutSummary: string | null;
}): ApiAcademicStatus | "" {
  if (m.occupationType === "JOB_HOLDER" && m.studyStatus == null) {
    return "professional";
  }
  if (m.studyStatus === "CURRENT_STUDENT") return "student";
  if (m.studyStatus === "GRADUATED") return "graduate";
  const parsed = parseAboutSummary(m.aboutSummary ?? null);
  return parsed.academicStatus ?? "";
}

export function mapRegisterToMemberFields(
  academicStatus: ApiAcademicStatus,
  sessionIntake: string,
): {
  studyStatus: "CURRENT_STUDENT" | "GRADUATED" | null;
  occupationType: "JOB_HOLDER" | null;
  aboutSummary: string;
} {
  const studyStatus: "CURRENT_STUDENT" | "GRADUATED" | null =
    academicStatus === "student"
      ? "CURRENT_STUDENT"
      : academicStatus === "graduate"
        ? "GRADUATED"
        : null;
  const occupationType: "JOB_HOLDER" | null =
    academicStatus === "professional" ? "JOB_HOLDER" : null;
  return {
    studyStatus,
    occupationType,
    aboutSummary: buildAboutSummary(academicStatus, sessionIntake),
  };
}
