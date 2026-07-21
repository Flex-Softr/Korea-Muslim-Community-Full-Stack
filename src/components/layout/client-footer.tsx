"use client";

import Link from "next/link";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { FooterScrollTop } from "@/components/layout/footer-scroll-top";
import { SiteLogoMark } from "@/components/layout/site-logo-mark";
import { useLanguage } from "@/components/providers/language-provider";
import {
  MEMBER_NAV_LABEL_KEYS,
  MEMBER_SLUGS,
  memberListingHref,
} from "@/lib/members/config";
import { cn } from "@/lib/utils";

function SocialLink({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-md transition-colors",
        className,
      )}
    >
      {children}
    </a>
  );
}

const INTRO_LINKS: { href: string; labelKey: string }[] = [
  {
    href: `/introduction/brief-introduction`,
    labelKey: "footer.linkIntroBriefIntroduction",
  },
  {
    href: `/introduction/constitution`,
    labelKey: "footer.linkIntroConstitution",
  },
  {
    href: `/introduction/organizational-method`,
    labelKey: "footer.linkIntroOrganizationalMethod",
  },
  {
    href: `/introduction/policies`,
    labelKey: "footer.linkIntroPolicies",
  },
  {
    href: `/introduction/introductory-registration`,
    labelKey: "footer.linkIntroIntroductoryRegistration",
  },
  {
    href: `/introduction/history-and-tradition`,
    labelKey: "footer.linkIntroHistoryAndTradition",
  },
];

const CENTRAL_ORG_LINKS: { href: string; labelKey: string }[] = [
  {
    href: `/organizational-structure/central-organization/central-working-procedure`,
    labelKey: "footer.linkCentralWorkingProcedure",
  },
  {
    href: `/organizational-structure/central-organization/central-shura-council`,
    labelKey: "footer.linkCentralShuraCouncil",
  },
  {
    href: `/organizational-structure/central-organization/other-leadership`,
    labelKey: "footer.linkOtherLeadership",
  },
];

const ORG_LINKS: { href: string; labelKey: string }[] = [
  {
    href: `/procedure/women-s-division`,
    labelKey: "footer.linkProcedureWomenDivision",
  },
  {
    href: `/procedure/student-division`,
    labelKey: "footer.linkProcedureStudentDivision",
  },
  {
    href: `/procedure/professional-division`,
    labelKey: "footer.linkProcedureProfessionalDivision",
  },
  {
    href: `/procedure/national-and-international`,
    labelKey: "footer.linkProcedureNationalAndInternational",
  },
];

const MEMBER_FOOTER_LINKS: { href: string; labelKey: string }[] =
  MEMBER_SLUGS.map((slug) => ({
    href: memberListingHref(slug),
    labelKey: MEMBER_NAV_LABEL_KEYS[slug],
  }));

const MEDIA_FOOTER_LINKS: { href: string; labelKey: string }[] = [
  { href: "/blog", labelKey: "common.blog" },
  { href: "/activity", labelKey: "common.activity" },
  { href: "/photo-gallery", labelKey: "common.photoGallery" },
  { href: "/video-gallery", labelKey: "common.videoGallery" },
];

/** In-app routes not covered by external org links or the media / member columns. */
const OTHER_FOOTER_LINKS: { href: string; labelKey: string }[] = [
  { href: "/", labelKey: "common.home" },
  { href: "/about", labelKey: "breadcrumbs.aboutUs" },
  { href: "/contact", labelKey: "breadcrumbs.contact" },
  { href: "/donation", labelKey: "common.donation" },
  { href: "/students", labelKey: "nav.students" },
  { href: "/education", labelKey: "nav.education" },
  { href: "/mosque", labelKey: "nav.mosque" },
];

/** Dynamic keys from `.map()` widen to `string`; narrow `t` to satisfy react-i18next + JSX typing (TS2322 / TS2589). */
function footerLinkLabel(
  t: ReturnType<typeof useLanguage>["t"],
  key: string,
): string {
  return (t as (k: string) => string)(key);
}

function FooterNavColumn({
  titleKey,
  links,
  t,
}: {
  titleKey: string;
  links: readonly { href: string; labelKey: string }[];
  t: ReturnType<typeof useLanguage>["t"];
}) {
  return (
    <div>
      <h4 className="text-lg font-semibold text-sky-400">
        {footerLinkLabel(t, titleKey)}
      </h4>
      <ul className="mt-3 space-y-1.5 text-md text-white/70">
        {links.map(({ href, labelKey }) => (
          <li key={href}>
            <Link href={href} className="hover:text-white">
              {footerLinkLabel(t, labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ClientFooter() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto overflow-hidden bg-[#0a1628] text-white">
      {/* Background texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -32deg,
            transparent,
            transparent 12px,
            rgba(255, 255, 255, 0.025) 12px,
            rgba(255, 255, 255, 0.025) 13px
          )`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2">
          {/* LEFT SIDE */}
          <div className="md:pr-8 lg:pr-12">
            <div className="flex items-start gap-3">
              <SiteLogoMark />
              <div>
                <p className="text-xl font-bold">{t("footer.brandTitle")}</p>
                <p className="text-md text-white/80">
                  {t("footer.brandTagline")}
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-md text-white/70">
              {t("footer.description")}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <SocialLink
                href="https://www.facebook.com/koreamuslimcommunity"
                label={t("footer.socialFacebook")}
                className="bg-[#1877f2] hover:bg-[#166fe5]"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </SocialLink>
              <SocialLink
                href="https://telegram.org"
                label={t("footer.socialTelegram")}
                className="bg-[#2aabee] hover:bg-[#229ed9]"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </SocialLink>
              <SocialLink
                href="https://x.com"
                label={t("footer.socialX")}
                className="bg-[#1d9bf0] hover:bg-[#1a8cd8]"
              >
                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </SocialLink>
              <SocialLink
                href="https://youtube.com"
                label={t("footer.socialYoutube")}
                className="bg-[#ff0000] hover:bg-[#e60000]"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </SocialLink>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold">
                {t("footer.contactTitle")}
              </h3>
              <ul className="mt-4 space-y-3 text-md">
                <li>
                  <Link
                    href="/contact"
                    className="flex gap-3 text-white/70 hover:text-white"
                  >
                    <Mail className="size-4 text-sky-400" />
                    {t("footer.emailContactForm")}
                  </Link>
                </li>

                <li className="flex gap-3 text-white/70">
                  <MapPin className="size-4 text-sky-400" />
                  {t("footer.location")}
                </li>

                <li>
                  <Link
                    href="/contact"
                    className="flex gap-3 text-white/70 hover:text-white"
                  >
                    <MessageCircle className="size-4 text-sky-400" />
                    {t("footer.contactUs")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT SIDE (LINK GROUPS) */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 md:gap-x-20">
            <FooterNavColumn
              titleKey="footer.secIntroduction"
              links={INTRO_LINKS}
              t={t}
            />
            <FooterNavColumn
              titleKey="footer.secOrganization"
              links={ORG_LINKS}
              t={t}
            />

            <FooterNavColumn
              titleKey="footer.secOther"
              links={OTHER_FOOTER_LINKS}
              t={t}
            />

            <FooterNavColumn
              titleKey="footer.secCentralOrganization"
              links={CENTRAL_ORG_LINKS}
              t={t}
            />
            <FooterNavColumn
              titleKey="nav.members"
              links={MEMBER_FOOTER_LINKS}
              t={t}
            />
            <FooterNavColumn
              titleKey="nav.media"
              links={MEDIA_FOOTER_LINKS}
              t={t}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-6 text-center text-sm text-white/60">
        <p>{t("footer.copyright", { year })}</p>

        <p className="mt-3">
          {t("footer.developedBy")}{" "}
          <a
            href="https://www.flexsoftr.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:underline"
          >
            FlexSoftr
          </a>
        </p>
      </div>

      <FooterScrollTop />
    </footer>
  );
}
