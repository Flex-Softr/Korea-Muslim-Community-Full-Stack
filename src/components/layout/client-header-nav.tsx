"use client";

import type { Session } from "next-auth";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { useLanguage, type Lang } from "@/components/providers/language-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { brandNavPillClass } from "@/components/layout/brand-nav-pill";
import { ClientUserMenu } from "@/components/layout/client-user-menu";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { useToastSystem } from "@/components/ui/toast-system";
import {
  SITE_NAV,
  type SiteNavSubLink,
  type SiteNavSubmenu,
  isSubLinkActive,
  isSubmenuActive,
  isTopLinkActive,
} from "@/config/site-nav";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import { MEMBER_NAV_LABELS, type MemberSlug } from "@/lib/members/config";
import { getLangTriggerShortLabel } from "@/lib/i18n/lang-trigger-label";
import { cn } from "@/lib/utils";

const LANG_OPTIONS: Array<{ value: Lang; labelKey: "common.bengali" | "common.english" | "common.korean" }> = [
  { value: "bn", labelKey: "common.bengali" },
  { value: "en", labelKey: "common.english" },
  { value: "kr", labelKey: "common.korean" },
];

function translateMemberLabel(slug: MemberSlug): string {
  return MEMBER_NAV_LABELS[slug];
}

function translateNavLabel(
  entry: SiteNavSubLink | { href?: string; id?: string; label: string },
  t: (key: TranslationKey) => string,
): string {
  if ("memberSlug" in entry && entry.memberSlug) {
    return translateMemberLabel(entry.memberSlug);
  }
  if (entry.href === "/") return t("common.home");
  if (entry.href === "/about") return t("common.about");
  if (entry.href === "/activity") return t("common.activity");
  if (entry.href === "/blog") return t("common.blog");
  if (entry.href === "/photo-gallery") return t("common.photoGallery");
  if (entry.href === "/video-gallery") return t("common.videoGallery");
  if (entry.href === "/donation") return t("common.donation");
  if ("id" in entry && entry.id === "media") return t("common.media");
  if ("id" in entry && entry.id === "members") return t("common.members");
  return entry.label;
}

function NavLink({
  href,
  label,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={brandNavPillClass(active)}
    >
      {label}
    </Link>
  );
}

function DesktopSubmenu({
  entry,
  pathname,
  searchParams,
  t,
}: {
  entry: SiteNavSubmenu;
  pathname: string;
  searchParams: URLSearchParams | null;
  t: (key: TranslationKey) => string;
}) {
  const router = useRouter();
  const open = isSubmenuActive(pathname, searchParams, entry);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        openOnHover
        delay={80}
        closeDelay={200}
        className={cn(
          brandNavPillClass(open),
          "cursor-default outline-none focus-visible:ring-2 focus-visible:ring-white/50",
        )}
      >
        {translateNavLabel(entry, t)}
        <ChevronDown className="size-4 shrink-0 opacity-90" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="min-w-52 rounded-xl p-1.5 shadow-lg"
      >
        {entry.items.map((item) => (
          <DropdownMenuItem
            key={item.href}
            className="cursor-pointer rounded-lg px-3 py-2.5 text-sm"
            onClick={() => router.push(item.href)}
          >
            {translateNavLabel(item, t)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DesktopNav({
  pathname,
  searchParams,
  t,
}: {
  pathname: string;
  searchParams: URLSearchParams | null;
  t: (key: TranslationKey) => string;
}) {
  return (
    <nav
      className="hidden min-w-0 items-center gap-0.5 lg:flex xl:gap-1"
      aria-label="Main menu"
    >
      {SITE_NAV.map((entry) => {
        if (entry.kind === "link") {
          return (
            <NavLink
              key={entry.href}
              href={entry.href}
              label={translateNavLabel(entry, t)}
              active={isTopLinkActive(pathname, entry.href)}
            />
          );
        }
        return (
          <DesktopSubmenu
            key={entry.id}
            entry={entry}
            pathname={pathname}
            searchParams={searchParams}
            t={t}
          />
        );
      })}
    </nav>
  );
}

function MobileSubLink({
  item,
  pathname,
  searchParams,
  onNavigate,
  t,
}: {
  item: SiteNavSubLink;
  pathname: string;
  searchParams: URLSearchParams | null;
  onNavigate: () => void;
  t: (key: TranslationKey) => string;
}) {
  const active = isSubLinkActive(pathname, searchParams, item);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={brandNavPillClass(active)}
    >
      {translateNavLabel(item, t)}
    </Link>
  );
}

function MobileNav({
  pathname,
  searchParams,
  mobileOpen,
  closeMobile,
  user,
  t,
}: {
  pathname: string;
  searchParams: URLSearchParams | null;
  mobileOpen: boolean;
  closeMobile: () => void;
  user: Session["user"] | null;
  t: (key: TranslationKey) => string;
}) {
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);

  const toggleSubmenu = (id: string) => {
    setOpenSubmenuId((cur) => (cur === id ? null : id));
  };

  return (
    <div
      id="mobile-site-nav"
      className={cn(
        "fixed inset-x-0 top-20 z-30 max-h-[calc(100dvh-5rem)] overflow-y-auto border-b border-white/10 bg-[#2a74a8] px-4 py-4 shadow-lg lg:hidden",
        mobileOpen ? "block" : "hidden",
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-1">
        {SITE_NAV.map((entry) => {
          if (entry.kind === "link") {
            return (
              <NavLink
                key={entry.href}
                href={entry.href}
                label={translateNavLabel(entry, t)}
                active={isTopLinkActive(pathname, entry.href)}
                onNavigate={closeMobile}
              />
            );
          }

          const expanded = openSubmenuId === entry.id;
          const submenuActive = isSubmenuActive(pathname, searchParams, entry);

          return (
            <div key={entry.id} className="flex flex-col gap-0.5">
              <button
                type="button"
                id={`mobile-submenu-${entry.id}`}
                className={cn(
                  brandNavPillClass(submenuActive),
                  "w-full justify-between text-left",
                )}
                aria-expanded={expanded}
                aria-controls={`mobile-submenu-panel-${entry.id}`}
                onClick={() => toggleSubmenu(entry.id)}
              >
                <span>{translateNavLabel(entry, t)}</span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 opacity-90 transition-transform",
                    expanded && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
              <div
                id={`mobile-submenu-panel-${entry.id}`}
                role="group"
                aria-labelledby={`mobile-submenu-${entry.id}`}
                className={cn(
                  "ml-1 flex flex-col gap-0.5 border-l-2 border-white/25 py-0.5 pl-3",
                  !expanded && "hidden",
                )}
              >
                {entry.items.map((item) => (
                  <MobileSubLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    searchParams={searchParams}
                    onNavigate={closeMobile}
                    t={t}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {!user ? (
          <Link
            href="/login"
            className="mt-2 rounded-md px-2.5 py-2 text-sm font-medium text-white hover:bg-white/10"
            onClick={closeMobile}
          >
            {t("common.login")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function ClientHeaderNavContent({
  user,
  searchParams,
}: {
  user: Session["user"] | null;
  searchParams: URLSearchParams | null;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const { notify } = useToastSystem();

  const closeMobile = () => {
    setMobileOpen(false);
  };

  return (
    <>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2 lg:gap-3">
        <DesktopNav pathname={pathname} searchParams={searchParams} t={t} />

        <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-3">
          <div data-no-auto-translate="true">
            <DropdownMenu open={langOpen} onOpenChange={setLangOpen}>
            <DropdownMenuTrigger
              className={cn(
                brandNavPillClass(false),
                "cursor-pointer border border-white/30 bg-white/10 text-xs",
              )}
            >
              <span>Lan: <span className="font-bold pl-1">{getLangTriggerShortLabel(lang)}</span></span>
              <ChevronDown className="size-4 shrink-0 opacity-80" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8}>
              {LANG_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  className="cursor-pointer"
                  onClick={() => {
                    setLang(option.value);
                    setLangOpen(false);
                    notify(t("common.languageChanged"), "success");
                  }}
                >
                  {t(option.labelKey)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <ModeToggle onBrand />

          {user ? (
            <ClientUserMenu
              email={user.email ?? ""}
              name={user.name}
              image={user.image}
              onBrand
            />
          ) : (
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-white hover:bg-white/15 hover:text-white",
              )}
            >
              {t("common.login")}
            </Link>
          )}

          <button
            type="button"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/15 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-site-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <MobileNav
        pathname={pathname}
        searchParams={searchParams}
        mobileOpen={mobileOpen}
        closeMobile={closeMobile}
        user={user}
        t={t}
      />
    </>
  );
}

/** Resolves `?type=` for member links; wrapped so static rendering stays valid. */
function ClientHeaderNavWithSearchParams({
  user,
}: {
  user: Session["user"] | null;
}) {
  const searchParams = useSearchParams();
  return (
    <ClientHeaderNavContent user={user} searchParams={searchParams} />
  );
}

function ClientHeaderNavFallback({ user }: { user: Session["user"] | null }) {
  return <ClientHeaderNavContent user={user} searchParams={null} />;
}

export function ClientHeaderNav({
  user,
}: {
  user: Session["user"] | null;
}) {
  const pathname = usePathname();
  return (
    <Suspense
      fallback={<ClientHeaderNavFallback key={pathname} user={user} />}
    >
      <ClientHeaderNavWithSearchParams key={pathname} user={user} />
    </Suspense>
  );
}
