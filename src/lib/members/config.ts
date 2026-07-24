export const MEMBER_CATEGORY = {
  CENTRAL_MEMBER: "CENTRAL_MEMBER",
  SURAH_MEMBER: "SURAH_MEMBER",
  MEMBER: "MEMBER",
  /** @deprecated Prefer CENTRAL_MEMBER — kept for existing DB rows. */
  EXECUTIVE: "EXECUTIVE",
  /** @deprecated Prefer SURAH_MEMBER — kept for existing DB rows. */
  ADVISOR_BODY: "ADVISOR_BODY",
} as const;

export type MemberCategory =
  | "CENTRAL_MEMBER"
  | "SURAH_MEMBER"
  | "MEMBER"
  | "EXECUTIVE"
  | "ADVISOR_BODY";

export const MEMBER_CATEGORIES = [
  MEMBER_CATEGORY.CENTRAL_MEMBER,
  MEMBER_CATEGORY.SURAH_MEMBER,
  MEMBER_CATEGORY.MEMBER,
] as const;

export const MEMBER_SLUGS = [
  "central-member",
  "surah-member",
  "member",
] as const;

export type MemberSlug = (typeof MEMBER_SLUGS)[number];

export const SLUG_TO_CATEGORY: Record<MemberSlug, MemberCategory> = {
  "central-member": MEMBER_CATEGORY.CENTRAL_MEMBER,
  "surah-member": MEMBER_CATEGORY.SURAH_MEMBER,
  member: MEMBER_CATEGORY.MEMBER,
};

export const CATEGORY_TO_SLUG: Record<MemberCategory, MemberSlug> = {
  [MEMBER_CATEGORY.CENTRAL_MEMBER]: "central-member",
  [MEMBER_CATEGORY.SURAH_MEMBER]: "surah-member",
  [MEMBER_CATEGORY.MEMBER]: "member",
  // Legacy DB values map to the renamed public slugs.
  [MEMBER_CATEGORY.EXECUTIVE]: "central-member",
  [MEMBER_CATEGORY.ADVISOR_BODY]: "surah-member",
};

export const DEFAULT_MEMBER_SLUG: MemberSlug = "central-member";

/** Categories that belong to a public listing slug (includes legacy values). */
export const SLUG_CATEGORY_FILTERS: Record<MemberSlug, MemberCategory[]> = {
  "central-member": [
    MEMBER_CATEGORY.CENTRAL_MEMBER,
    MEMBER_CATEGORY.EXECUTIVE,
  ],
  "surah-member": [
    MEMBER_CATEGORY.SURAH_MEMBER,
    MEMBER_CATEGORY.ADVISOR_BODY,
  ],
  member: [MEMBER_CATEGORY.MEMBER],
};

export function isMemberCategory(v: string): v is MemberCategory {
  return (
    v === MEMBER_CATEGORY.CENTRAL_MEMBER ||
    v === MEMBER_CATEGORY.SURAH_MEMBER ||
    v === MEMBER_CATEGORY.MEMBER ||
    v === MEMBER_CATEGORY.EXECUTIVE ||
    v === MEMBER_CATEGORY.ADVISOR_BODY
  );
}

/** Normalize legacy category values to the current canonical ones. */
export function normalizeMemberCategory(v: string): MemberCategory | null {
  if (!isMemberCategory(v)) return null;
  if (v === MEMBER_CATEGORY.EXECUTIVE) return MEMBER_CATEGORY.CENTRAL_MEMBER;
  if (v === MEMBER_CATEGORY.ADVISOR_BODY) return MEMBER_CATEGORY.SURAH_MEMBER;
  return v;
}

export function slugFromSearchParam(
  type: string | string[] | null | undefined,
): MemberSlug {
  const raw = Array.isArray(type) ? type[0] : type;
  if (raw && MEMBER_SLUGS.includes(raw as MemberSlug)) {
    return raw as MemberSlug;
  }
  // Accept previous pathnames so old links keep working.
  if (raw === "executive") return "central-member";
  if (raw === "advisor-body") return "surah-member";
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
  "central-member": {
    title: "members.section.centralMember.title",
    subtitle: "members.section.centralMember.subtitle",
    emptyMessage: "members.section.centralMember.emptyMessage",
  },
  "surah-member": {
    title: "members.section.surahMember.title",
    subtitle: "members.section.surahMember.subtitle",
    emptyMessage: "members.section.surahMember.emptyMessage",
  },
  member: {
    title: "members.section.member.title",
    subtitle: "members.section.member.subtitle",
    emptyMessage: "members.section.member.emptyMessage",
  },
};

export const MEMBER_NAV_LABEL_KEYS: Record<MemberSlug, string> = {
  "central-member": "members.nav.centralMember",
  "surah-member": "members.nav.surahMember",
  member: "members.nav.member",
};
