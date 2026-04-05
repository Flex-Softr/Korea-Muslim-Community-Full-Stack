export const MEMBER_CATEGORY = {
  EXECUTIVE: "EXECUTIVE",
  ADVISOR_BODY: "ADVISOR_BODY",
  GENERAL: "GENERAL",
} as const;

export type MemberCategory =
  (typeof MEMBER_CATEGORY)[keyof typeof MEMBER_CATEGORY];

export const MEMBER_SLUGS = ["executive", "advisor-body", "general"] as const;

export type MemberSlug = (typeof MEMBER_SLUGS)[number];

export const SLUG_TO_CATEGORY: Record<MemberSlug, MemberCategory> = {
  executive: MEMBER_CATEGORY.EXECUTIVE,
  "advisor-body": MEMBER_CATEGORY.ADVISOR_BODY,
  general: MEMBER_CATEGORY.GENERAL,
};

export const CATEGORY_TO_SLUG: Record<MemberCategory, MemberSlug> = {
  [MEMBER_CATEGORY.EXECUTIVE]: "executive",
  [MEMBER_CATEGORY.ADVISOR_BODY]: "advisor-body",
  [MEMBER_CATEGORY.GENERAL]: "general",
};

export const DEFAULT_MEMBER_SLUG: MemberSlug = "executive";

export function isMemberCategory(v: string): v is MemberCategory {
  return (
    v === MEMBER_CATEGORY.EXECUTIVE ||
    v === MEMBER_CATEGORY.ADVISOR_BODY ||
    v === MEMBER_CATEGORY.GENERAL
  );
}

export function slugFromSearchParam(
  type: string | string[] | null | undefined,
): MemberSlug {
  const raw = Array.isArray(type) ? type[0] : type;
  if (raw && MEMBER_SLUGS.includes(raw as MemberSlug)) {
    return raw as MemberSlug;
  }
  return DEFAULT_MEMBER_SLUG;
}

export function memberListingHref(slug: MemberSlug): string {
  return `/member?type=${slug}`;
}

/** Public profile URL (uses stable DB id). */
export function memberDetailHref(memberId: string): string {
  return `/member/${memberId}`;
}

export const MEMBER_SECTION_COPY: Record<
  MemberSlug,
  { title: string; subtitle: string; emptyMessage: string }
> = {
  executive: {
    title: "Executive members",
    subtitle:
      "Leadership and office holders who coordinate programmes and represent the community.",
    emptyMessage:
      "Executive listings will appear here once profiles are published.",
  },
  "advisor-body": {
    title: "Advisor body",
    subtitle:
      "Scholars and senior advisors who guide the organisation on faith, ethics, and strategy.",
    emptyMessage:
      "Advisor profiles will appear here once they are published.",
  },
  general: {
    title: "General members",
    subtitle:
      "Volunteers, coordinators, and active members helping run events and services.",
    emptyMessage:
      "General member highlights will appear here when available.",
  },
};

export const MEMBER_NAV_LABELS: Record<MemberSlug, string> = {
  executive: "Executive Member",
  "advisor-body": "Advisor Body",
  general: "General Member",
};
