import {
  MEMBER_NAV_LABELS,
  MEMBER_SLUGS,
  memberListingHref,
  slugFromSearchParam,
  type MemberSlug,
} from "@/lib/members/config";

/** Single destination inside a submenu (or standalone link target). */
export type SiteNavSubLink = {
  href: string;
  label: string;
  /** When set, active only if pathname is `/member` and `?type=` matches this slug. */
  memberSlug?: MemberSlug;
};

export type SiteNavSubmenu = {
  kind: "submenu";
  /** Stable id for mobile accordion state */
  id: string;
  label: string;
  items: SiteNavSubLink[];
};

export type SiteNavLink = {
  kind: "link";
  href: string;
  label: string;
};

export type SiteNavEntry = SiteNavLink | SiteNavSubmenu;

const memberSubLinks: SiteNavSubLink[] = MEMBER_SLUGS.map((slug) => ({
  href: memberListingHref(slug),
  label: MEMBER_NAV_LABELS[slug],
  memberSlug: slug,
}));

/**
 * Main site navigation — one array drives desktop and mobile.
 * Edit structure here only; submenus render as dropdowns (desktop) and accordions (mobile).
 */
export const SITE_NAV: SiteNavEntry[] = [
  { kind: "link", href: "/", label: "Home" },
  { kind: "link", href: "/about", label: "About" },
  { kind: "link", href: "/activity", label: "Activity" },
  { kind: "link", href: "/blog", label: "Blog" },
  {
    kind: "submenu",
    id: "media",
    label: "Media",
    items: [
      { href: "/photo-gallery", label: "Photo Gallery" },
      { href: "/video-gallery", label: "Video Gallery" },
    ],
  },
  {
    kind: "submenu",
    id: "members",
    label: "Members",
    items: memberSubLinks,
  },
 
  { kind: "link", href: "/donation", label: "Donation" },
];

export function isSubLinkActive(
  pathname: string,
  searchParams: URLSearchParams | null,
  item: SiteNavSubLink,
): boolean {
  if (item.memberSlug) {
    if (pathname !== "/member" || !searchParams) {
      return false;
    }
    return slugFromSearchParam(searchParams.get("type")) === item.memberSlug;
  }
  const base = item.href.split("?")[0] ?? item.href;
  if (base === "/") {
    return pathname === "/";
  }
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function isSubmenuActive(
  pathname: string,
  searchParams: URLSearchParams | null,
  entry: SiteNavSubmenu,
): boolean {
  return entry.items.some((item) =>
    isSubLinkActive(pathname, searchParams, item),
  );
}

export function isTopLinkActive(
  pathname: string,
  href: string,
): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
