import {
  MEMBER_NAV_LABELS,
  MEMBER_SLUGS,
  memberListingHref,
  slugFromSearchParam,
  type MemberSlug,
} from "@/lib/members/config";

/**
 * Recursive Nav Type
 */
export type SiteNavItem = {
  kind: "link" | "submenu";
  label: string;
  href?: string;
  id?: string;
  items?: SiteNavItem[];
};

/**
 * Member sublinks
 */
const memberSubLinks: SiteNavItem[] = MEMBER_SLUGS.map((slug) => ({
  kind: "link",
  href: memberListingHref(slug),
  label: MEMBER_NAV_LABELS[slug],
}));

/**
 * MAIN NAV
 */
export const SITE_NAV: SiteNavItem[] = [
  { kind: "link", href: "/", label: "Home" },
  // { kind: "link", href: "/about", label: "About" },
  // { kind: "link", href: "/activity", label: "Activity" },
  // { kind: "link", href: "/blog", label: "Blog" },

    /**
   * Community & Procedure
   */
    {
      kind: "submenu",
      id: "organization-activities",
      label: "Organization & Activities",
      items: [
        {
          kind: "submenu",
          id: "introduction",
          label: "Introduction",
          items: [
            { kind: "link", href: "/introduction/brief-introduction", label: "Brief Introduction" },
            { kind: "link", href: "/introduction/constitution", label: "Constitution" },
            { kind: "link", href: "/introduction/organizational-method", label: "Organizational Method" },
            { kind: "link", href: "/introduction/policies", label: "Policies" },
            { kind: "link", href: "/introduction/history-and-tradition", label: "History & Tradition" },
            { kind: "link", href: "/introduction/introductory-registration", label: "Introductory Registration" },
          ],
        },
        {
          kind: "submenu",
          id: "organizational-structure",
          label: "Organizational Structure",
          items: [
            { kind: "submenu",
              id: "central-organization",
              label: "Central Organization",
              items: [
                { kind: "link", href: "/organizational-structure/central-organization/central-working-procedure", label: "Central Working Procedure" },
                { kind: "link", href: "/organizational-structure/central-organization/central-shura-council", label: "Central Shura (Council)" },
                { kind: "link", href: "/organizational-structure/central-organization/other-leadership", label: "Other Leadership" },
              ],
            },
            { kind: "link", href: "/procedure/women-s-division", label: "Women’s Division" },
            { kind: "link", href: "/procedure/student-division", label: "Student Division" },
            { kind: "link", href: "/procedure/professional-division", label: "Professional Division" },
            { kind: "link", href: "/procedure/national-and-international", label: "National & International" },
          ],
        },
      ],
    },

    
  {
    kind: "submenu",
    id: "media",
    label: "Media",
    items: [
      { kind: "link", href: "/photo-gallery", label: "Photo Gallery" },
      { kind: "link", href: "/video-gallery", label: "Video Gallery" },
    ],
  },

  {
    kind: "submenu",
    id: "members",
    label: "Members",
    items: memberSubLinks,
  },


  /**
   * ✅ NEW: EPS MENU
   */
  {
    kind: "submenu",
    id: "eps",
    label: "EPS",
    items: [
      { kind: "link", href: "/eps/form", label: "Form" },
      { kind: "link", href: "/eps/link", label: "Link" },
      { kind: "link", href: "/eps/app", label: "App" },
    ],
  },
  { kind: "link", href: "/students", label: "Students" },
{ kind: "link", href: "/education", label: "Education" },
{ kind: "link", href: "/mosque", label: "Mosque" },
  // { kind: "link", href: "/donation", label: "Donation" },
];

/**
 * -----------------------------
 * ACTIVE STATE HELPERS
 * -----------------------------
 */

export function isNavItemActive(
  pathname: string,
  searchParams: URLSearchParams | null,
  item: SiteNavItem,
): boolean {
  if (item.kind === "link" && item.href) {
    const base = item.href.split("?")[0];
    if (base === "/") return pathname === "/";
    return pathname === base || pathname.startsWith(`${base}/`);
  }

  if (item.kind === "submenu" && item.items) {
    return item.items.some((child) =>
      isNavItemActive(pathname, searchParams, child),
    );
  }

  return false;
}

export function isTopLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}


// import {
//   MEMBER_NAV_LABELS,
//   MEMBER_SLUGS,
//   memberListingHref,
//   slugFromSearchParam,
//   type MemberSlug,
// } from "@/lib/members/config";

// /** Single destination inside a submenu (or standalone link target). */
// export type SiteNavSubLink = {
//   href: string;
//   label: string;
//   /** When set, active only if pathname is `/member` and `?type=` matches this slug. */
//   memberSlug?: MemberSlug;
// };

// export type SiteNavSubmenu = {
//   kind: "submenu";
//   /** Stable id for mobile accordion state */
//   id: string;
//   label: string;
//   items: SiteNavSubLink[];
// };

// export type SiteNavLink = {
//   kind: "link";
//   href: string;
//   label: string;
// };

// export type SiteNavEntry = SiteNavLink | SiteNavSubmenu;

// const memberSubLinks: SiteNavSubLink[] = MEMBER_SLUGS.map((slug) => ({
//   href: memberListingHref(slug),
//   label: MEMBER_NAV_LABELS[slug],
//   memberSlug: slug,
// }));

// /**
//  * Main site navigation — one array drives desktop and mobile.
//  * Edit structure here only; submenus render as dropdowns (desktop) and accordions (mobile).
//  */
// export const SITE_NAV: SiteNavEntry[] = [
//   { kind: "link", href: "/", label: "Home" },
//   { kind: "link", href: "/about", label: "About" },
//   { kind: "link", href: "/activity", label: "Activity" },
//   { kind: "link", href: "/blog", label: "Blog" },
//   {
//     kind: "submenu",
//     id: "media",
//     label: "Media",
//     items: [
//       { href: "/photo-gallery", label: "Photo Gallery" },
//       { href: "/video-gallery", label: "Video Gallery" },
//     ],
//   },
//   {
//     kind: "submenu",
//     id: "members",
//     label: "Members",
//     items: memberSubLinks,
//   },
 
//   { kind: "link", href: "/donation", label: "Donation" },
// ];

// export function isSubLinkActive(
//   pathname: string,
//   searchParams: URLSearchParams | null,
//   item: SiteNavSubLink,
// ): boolean {
//   if (item.memberSlug) {
//     if (pathname !== "/member" || !searchParams) {
//       return false;
//     }
//     return slugFromSearchParam(searchParams.get("type")) === item.memberSlug;
//   }
//   const base = item.href.split("?")[0] ?? item.href;
//   if (base === "/") {
//     return pathname === "/";
//   }
//   return pathname === base || pathname.startsWith(`${base}/`);
// }

// export function isSubmenuActive(
//   pathname: string,
//   searchParams: URLSearchParams | null,
//   entry: SiteNavSubmenu,
// ): boolean {
//   return entry.items.some((item) =>
//     isSubLinkActive(pathname, searchParams, item),
//   );
// }

// export function isTopLinkActive(
//   pathname: string,
//   href: string,
// ): boolean {
//   if (href === "/") {
//     return pathname === "/";
//   }
//   return pathname === href || pathname.startsWith(`${href}/`);
// }
