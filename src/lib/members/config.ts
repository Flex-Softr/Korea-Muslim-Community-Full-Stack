export const MEMBER_CATEGORY = {
  EXECUTIVE: "EXECUTIVE",
  ADVISOR_BODY: "ADVISOR_BODY",
} as const;

export type MemberCategory =
  (typeof MEMBER_CATEGORY)[keyof typeof MEMBER_CATEGORY];

export const MEMBER_CATEGORIES = [
  MEMBER_CATEGORY.EXECUTIVE,
  MEMBER_CATEGORY.ADVISOR_BODY,
] as const;

export const MEMBER_SLUGS = ["executive", "advisor-body"] as const;

export type MemberSlug = (typeof MEMBER_SLUGS)[number];

export const SLUG_TO_CATEGORY: Record<MemberSlug, MemberCategory> = {
  executive: MEMBER_CATEGORY.EXECUTIVE,
  "advisor-body": MEMBER_CATEGORY.ADVISOR_BODY,
};

export const CATEGORY_TO_SLUG: Record<MemberCategory, MemberSlug> = {
  [MEMBER_CATEGORY.EXECUTIVE]: "executive",
  [MEMBER_CATEGORY.ADVISOR_BODY]: "advisor-body",
};

export const DEFAULT_MEMBER_SLUG: MemberSlug = "executive";

export function isMemberCategory(v: string): v is MemberCategory {
  return (
    v === MEMBER_CATEGORY.EXECUTIVE ||
    v === MEMBER_CATEGORY.ADVISOR_BODY
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

/** i18n dot-keys under `members.section.*` in locale JSON. */
export const MEMBER_SECTION_I18N_KEYS: Record<
  MemberSlug,
  { title: string; subtitle: string; emptyMessage: string }
> = {
  executive: {
    title: "members.section.executive.title",
    subtitle: "members.section.executive.subtitle",
    emptyMessage: "members.section.executive.emptyMessage",
  },
  "advisor-body": {
    title: "members.section.advisorBody.title",
    subtitle: "members.section.advisorBody.subtitle",
    emptyMessage: "members.section.advisorBody.emptyMessage",
  },
};

export const MEMBER_NAV_LABEL_KEYS: Record<MemberSlug, string> = {
  executive: "members.nav.executive",
  "advisor-body": "members.nav.advisorBody",
};
