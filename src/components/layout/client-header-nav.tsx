"use client";

import type { Session } from "next-auth";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { brandNavPillClass } from "@/components/layout/brand-nav-pill";
import { cn } from "@/lib/utils";

import {
  SITE_NAV,
  type SiteNavItem,
  isNavItemActive,
} from "@/config/site-nav";
import {
  flyoutBranchTint,
  flyoutPanel,
  flyoutRowClass,
  flyoutStartHidden,
  revealDirectUl,
} from "@/components/layout/nav-flyout-classes";
import type { Lang } from "@/lib/i18n/lang";
import { DownloadMenu } from "@/components/layout/client-header-download-button";
import { SiteLogoMark } from "./site-logo-mark";
import { useLanguage } from "@/components/providers/language-provider";

/** Nav uses runtime-built keys (`labelKey` strings); widen typed `t` from locale JSON. */
type NavTranslate = (key: string) => string;

function navItemReactKey(item: SiteNavItem): string {
  return `${item.labelKey}-${item.href ?? item.id ?? ""}`;
}

function DesktopFlyoutItem({
  item,
  pathname,
  searchParams,
  depth,
  lang,
  t,
}: {
  item: SiteNavItem;
  pathname: string;
  searchParams: URLSearchParams | null;
  depth: number;
  lang: Lang;
  t: NavTranslate;
}) {
  const active =
    item.kind === "link" &&
    isNavItemActive(pathname, searchParams, item);

  if (item.kind === "link") {
    return (
      <li role="presentation">
        <Link
          href={item.href || "#"}
          role="menuitem"
          className={cn(
            flyoutRowClass(lang),
            active &&
              "underline decoration-white underline-offset-[3px] hover:bg-[#235d94]",
          )}
        >
          {t(item.labelKey)}
        </Link>
      </li>
    );
  }

  const branchActive = isNavItemActive(pathname, searchParams, item);

  return (
    <li role="presentation" className={cn("relative", revealDirectUl)}>
      <div
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={false}
        tabIndex={-1}
        className={cn(
          flyoutRowClass(lang),
          "cursor-default justify-between pr-3",
          branchActive && flyoutBranchTint,
        )}
      >
        <span>{t(item.labelKey)}</span>
        <span className="shrink-0 text-xs leading-none opacity-95 lg:text-sm" aria-hidden>
          ▸
        </span>
      </div>
      <ul
        role="menu"
        className={cn(flyoutPanel, "absolute left-full top-0", flyoutStartHidden)}
        style={{ zIndex: 50 + depth }}
      >
        {item.items?.map((child) => (
          <DesktopFlyoutItem
            key={navItemReactKey(child)}
            item={child}
            pathname={pathname}
            searchParams={searchParams}
            depth={depth + 1}
            lang={lang}
            t={t}
          />
        ))}
      </ul>
    </li>
  );
}

function DesktopFlyoutRoot({
  items,
  pathname,
  searchParams,
  lang,
  t,
}: {
  items: SiteNavItem[];
  pathname: string;
  searchParams: URLSearchParams | null;
  lang: Lang;
  t: NavTranslate;
}) {
  return (
    <ul
      role="menu"
      className={cn(flyoutPanel, "absolute left-0 top-full z-50", flyoutStartHidden)}
    >
      {items.map((child) => (
        <DesktopFlyoutItem
          key={navItemReactKey(child)}
          item={child}
          pathname={pathname}
          searchParams={searchParams}
          depth={1}
          lang={lang}
          t={t}
        />
      ))}
    </ul>
  );
}

function DesktopMenu({
  item,
  pathname,
  searchParams,
  lang,
  t,
}: {
  item: SiteNavItem;
  pathname: string;
  searchParams: URLSearchParams | null;
  lang: Lang;
  t: NavTranslate;
}) {
  const active = isNavItemActive(pathname, searchParams, item);

  if (item.kind === "link") {
    return (
      <Link href={item.href!} className={brandNavPillClass(active, lang)}>
        {t(item.labelKey)}
      </Link>
    );
  }

  return (
    <div className={cn("relative inline-flex", revealDirectUl)}>
      <span
        className={cn(
          brandNavPillClass(active, lang),
          "inline-flex cursor-default select-none items-center gap-1.5",
        )}
      >
        {t(item.labelKey)}
        <span className="text-xs leading-none opacity-90 lg:text-sm" aria-hidden>
          ▸
        </span>
      </span>
      <DesktopFlyoutRoot
        items={item.items ?? []}
        pathname={pathname}
        searchParams={searchParams}
        lang={lang}
        t={t}
      />
    </div>
  );
}

function DesktopNav({
  pathname,
  searchParams,
  lang,
  t,
}: {
  pathname: string;
  searchParams: URLSearchParams | null;
  lang: Lang;
  t: NavTranslate;
}) {
  return (
    <nav className="hidden lg:flex gap-2">
      {SITE_NAV.map((item) => (
        <DesktopMenu
          key={item.labelKey}
          item={item}
          pathname={pathname}
          searchParams={searchParams}
          lang={lang}
          t={t}
        />
      ))}
    </nav>
  );
}

function MobileMenu({
  item,
  pathname,
  searchParams,
  close,
  lang,
  t,
}: {
  item: SiteNavItem;
  pathname: string;
  searchParams: URLSearchParams | null;
  close: () => void;
  lang: Lang;
  t: NavTranslate;
}) {
  const [open, setOpen] = useState(false);

  const active = isNavItemActive(pathname, searchParams, item);

  if (item.kind === "link") {
    return (
      <Link
        href={item.href!}
        onClick={close}
        className={brandNavPillClass(active, lang)}
      >
        {t(item.labelKey)}
      </Link>
    );
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          brandNavPillClass(active, lang),
          "flex w-full justify-between",
        )}
      >
        {t(item.labelKey)}
        <ChevronDown
          className={cn("size-4 transition", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="ml-3 flex flex-col border-l pl-3">
          {item.items?.map((child) => (
            <MobileMenu
              key={navItemReactKey(child)}
              item={child}
              pathname={pathname}
              searchParams={searchParams}
              close={close}
              lang={lang}
              t={t}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MobileNav({
  pathname,
  searchParams,
  open,
  close,
  lang,
  t,
}: {
  pathname: string;
  searchParams: URLSearchParams | null;
  open: boolean;
  close: () => void;
  lang: Lang;
  t: NavTranslate;
}) {
  return (
    <>
      <div
        role="presentation"
        onClick={close}
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <div
        className={`fixed top-0 right-0 z-80 flex h-full max-h-[100dvh] w-[100%] flex-col bg-[#2a74a8] transition-transform duration-300 ease-in-out md:w-[50%] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-10 flex shrink-0 items-center justify-between px-4 pt-4">
          <SiteLogoMark priority className="h-12 w-12 sm:h-12 sm:w-12" />
          <button type="button" onClick={close} className="text-white">
            <X className="size-6 h-8 w-8 rounded-sm p-0 shadow-sm shadow-zinc-800/60 hover:bg-zinc-800 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-background dark:text-zinc-300 dark:hover:bg-zinc-800" />
          </button>
        </div>

        <div
          className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto overscroll-contain px-4 pb-[max(2rem,calc(env(safe-area-inset-bottom)+2rem))]"
        >
          <div className="flex flex-col gap-2">
            {SITE_NAV.map((item) => (
              <MobileMenu
                key={item.labelKey}
                item={item}
                pathname={pathname}
                searchParams={searchParams}
                close={close}
                lang={lang}
                t={t}
              />
            ))}
          </div>

          <div className="my-4 shrink-0 border-t border-white/30" />

          <div className="shrink-0 pb-1">
            <DownloadMenu variant="drawer" />
          </div>
        </div>
      </div>
    </>
  );
}

function HeaderInner({ user }: { user: Session["user"] | null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, lang } = useLanguage();
  const navT = t as NavTranslate;

  const close = () => setMobileOpen(false);

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <DesktopNav
          pathname={pathname}
          searchParams={searchParams}
          lang={lang}
          t={navT}
        />

        <div className="hidden pl-4 md:block">
          <DownloadMenu variant="header" />
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden"
        >
          {mobileOpen ? (
            <X />
          ) : (
            <Menu className="size-6 h-10 w-10 rounded-sm p-1 shadow-sm shadow-zinc-800/60 hover:bg-zinc-800 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-background dark:text-zinc-300 dark:hover:bg-zinc-800" />
          )}
        </button>
      </div>

      <MobileNav
        pathname={pathname}
        searchParams={searchParams}
        open={mobileOpen}
        close={close}
        lang={lang}
        t={navT}
      />
    </>
  );
}

export function ClientHeaderNav({ user }: { user: Session["user"] | null }) {
  const pathname = usePathname();

  return (
    <Suspense key={pathname}>
      <HeaderInner user={user} />
    </Suspense>
  );
}
