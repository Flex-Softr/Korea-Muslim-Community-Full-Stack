import {
  MEMBER_NAV_LABEL_KEYS,
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
  labelKey: string;
  href?: string;
  id?: string;
  items?: SiteNavItem[];
};

/**
 * Member sublinks
 */
const memberSubLinks: SiteNavItem[] = MEMBER_SLUGS.map((slug: MemberSlug) => ({
  kind: "link",
  href: memberListingHref(slug),
  labelKey: MEMBER_NAV_LABEL_KEYS[slug],
}));

/**
 * MAIN NAV
 */
export const SITE_NAV: SiteNavItem[] = [
  { kind: "link", href: "/", labelKey: "nav.home" },
  {
    kind: "submenu",
    id: "organization-activities",
    labelKey: "nav.organizationActivities",
    items: [
      {
        kind: "submenu",
        id: "introduction",
        labelKey: "nav.introduction",
        items: [
          {
            kind: "link",
            href: "/introduction/brief-introduction",
            labelKey: "nav.briefIntroduction",
          },
          {
            kind: "link",
            href: "/introduction/constitution",
            labelKey: "nav.constitution",
          },
          {
            kind: "link",
            href: "/introduction/organizational-method",
            labelKey: "nav.organizationalMethod",
          },
          {
            kind: "link",
            href: "/introduction/policies",
            labelKey: "nav.policies",
          },
          {
            kind: "link",
            href: "/introduction/history-and-tradition",
            labelKey: "nav.historyAndTradition",
          },
          {
            kind: "link",
            href: "/introduction/introductory-registration",
            labelKey: "nav.introductoryRegistration",
          },
        ],
      },
      {
        kind: "submenu",
        id: "organizational-structure",
        labelKey: "nav.organizationalStructure",
        items: [
          {
            // kind: "submenu",
            kind: "link",
            href: "/procedure/central-organization",
            labelKey: "nav.centralOrganization",
            // items: [
            //   {
            //     kind: "link",
            //     href: "/organizational-structure/central-organization/central-working-procedure",
            //     labelKey: "nav.centralWorkingProcedure",
            //   },
            //   {
            //     kind: "link",
            //     href: "/organizational-structure/central-organization/central-shura-council",
            //     labelKey: "nav.centralShuraCouncil",
            //   },
            //   {
            //     kind: "link",
            //     href: "/organizational-structure/central-organization/other-leadership",
            //     labelKey: "nav.otherLeadership",
            //   },
            // ],
          },
          {
            kind: "link",
            href: "/procedure/women-s-division",
            labelKey: "nav.womensDivision",
          },
          {
            kind: "link",
            href: "/procedure/student-division",
            labelKey: "nav.studentDivision",
          },
          {
            kind: "link",
            href: "/procedure/professional-division",
            labelKey: "nav.professionalDivision",
          },
          {
            kind: "link",
            href: "/procedure/national-and-international",
            labelKey: "nav.nationalAndInternational",
          },
        ],
      },
    ],
  },

  {
    kind: "submenu",
    id: "media",
    labelKey: "nav.media",
    items: [
      {
        kind: "link",
        href: "/photo-gallery",
        labelKey: "nav.photoGallery",
      },
      {
        kind: "link",
        href: "/video-gallery",
        labelKey: "nav.videoGallery",
      },
      {
        kind: "link",
        href: "/blog",
        labelKey: "nav.blog",
      },
      {
        kind: "link",
        href: "/activity",
        labelKey: "nav.activity",
      },
    ],
  },

  {
    kind: "submenu",
    id: "members",
    labelKey: "nav.members",
    items: memberSubLinks,
  },

  { kind: "link", href: "/eps", labelKey: "nav.eps" },
  // {
  //   kind: "submenu",
  //   id: "download",
  //   labelKey: "nav.download",
  //   items: [
  //     { kind: "link", href: "/download/pdf", labelKey: "breadcrumbs.downloadPdf" },
  //     { kind: "link", href: "/download/book", labelKey: "breadcrumbs.downloadBook" },
  //     { kind: "link", href: "/download/form", labelKey: "breadcrumbs.downloadForm" },
  //     { kind: "link", href: "/download/syllabus", labelKey: "breadcrumbs.downloadSyllabus" },
  //     { kind: "link", href: "/download/poster", labelKey: "breadcrumbs.downloadPoster" },
  //     { kind: "link", href: "/download/ebook-leaflet", labelKey: "breadcrumbs.downloadEbookLeaflet" },
  //   ],
  // },
  { kind: "link", href: "/students", labelKey: "nav.students" },
  { kind: "link", href: "/education", labelKey: "nav.education" },
  { kind: "link", href: "/mosque", labelKey: "nav.mosque" },
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
    return item.items.some(child =>
      isNavItemActive(pathname, searchParams, child),
    );
  }

  return false;
}

export function isTopLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
