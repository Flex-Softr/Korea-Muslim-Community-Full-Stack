"use client";

import type { Session } from "next-auth";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { brandNavPillClass } from "@/components/layout/brand-nav-pill";
import { ClientUserMenu } from "@/components/layout/client-user-menu";
import { cn } from "@/lib/utils";


import {
  SITE_NAV,
  type SiteNavItem,
  isNavItemActive,
} from "@/config/site-nav";
import { DownloadMenu } from "./client-header-download-button";
import { SiteLogoMark } from "./site-logo-mark";

/* -------------------------
   RECURSIVE DROPDOWN ITEM
--------------------------*/
function DropdownItem({
  item,
  depth = 0,
}: {
  item: SiteNavItem;
  depth?: number;
}) {
  const [open, setOpen] = useState(false);

  // Simple link
  if (item.kind === "link") {
    return (
      <Link
        href={item.href || "#"}
        className="block px-4 py-2 text-sm hover:bg-black hover:text-white transition hover:rounded-md"
      >
        {item.label}
      </Link>
    );
  }

  // Item with children
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-black hover:text-white transition hover:rounded-sm"
      >
        {item.label}
        <ChevronRight
          className={cn(
            "size-4 transition",
            open && "rotate-90"
          )}
        />
      </button>

      {open && (
        <div className="ml-3 border-l border-white/10">
          {item.items?.map((child) => (
            <DropdownItem
              key={child.label}
              item={child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------
   DESKTOP MENU (CLICK BASED)
--------------------------*/
function DesktopMenu({
  item,
  pathname,
  searchParams,
}: {
  item: SiteNavItem;
  pathname: string;
  searchParams: URLSearchParams | null;
}) {
  const [open, setOpen] = useState(false);

  const active = isNavItemActive(pathname, searchParams, item);

  if (item.kind === "link") {
    return (
      <Link href={item.href!} className={brandNavPillClass(active)}>
        {item.label}
      </Link>
    );
  }

  return (
    <div className="relative">
      {/* Parent Button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          brandNavPillClass(active),
          "flex items-center gap-1"
        )}
      >
        {item.label}
        <ChevronDown
          className={cn(
            "size-4 transition",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 min-w-[220px] bg-[#0a1628] text-white rounded-sm shadow-2xl border border-white/10">
          {item.items?.map((child) => (
            <DropdownItem key={child.label} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------
   DESKTOP NAV
--------------------------*/
function DesktopNav({
  pathname,
  searchParams,
}: {
  pathname: string;
  searchParams: URLSearchParams | null;
}) {
  return (
    <nav className="hidden lg:flex gap-2">
      {SITE_NAV.map((item) => (
        <DesktopMenu
          key={item.label}
          item={item}
          pathname={pathname}
          searchParams={searchParams}
        />
      ))}
    </nav>
  );
}

/* -------------------------
   MOBILE MENU (UNCHANGED)
--------------------------*/
function MobileMenu({
  item,
  pathname,
  searchParams,
  close,
}: {
  item: SiteNavItem;
  pathname: string;
  searchParams: URLSearchParams | null;
  close: () => void;
}) {
  const [open, setOpen] = useState(false);

  const active = isNavItemActive(pathname, searchParams, item);

  if (item.kind === "link") {
    return (
      <Link
        href={item.href!}
        onClick={close}
        className={brandNavPillClass(active)}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          brandNavPillClass(active),
          "flex w-full justify-between"
        )}
      >
        {item.label}
        <ChevronDown
          className={cn("size-4 transition", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="ml-3 flex flex-col border-l pl-3">
          {item.items?.map((child) => (
            <MobileMenu
              key={child.label}
              item={child}
              pathname={pathname}
              searchParams={searchParams}
              close={close}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------
   MOBILE NAV
--------------------------*/

function MobileNav({
  pathname,
  searchParams,
  open,
  close,
}: {
  pathname: string;
  searchParams: URLSearchParams | null;
  open: boolean;
  close: () => void;
}) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={close}
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Drawer (Right Side) */}
      <div
        className={`fixed top-0 right-0 z-80 h-full w-[100%] md:w-[50%] bg-[#2a74a8] p-4 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
        <SiteLogoMark priority className="h-12 w-12 sm:h-12 sm:w-12" />
        {/* <h2 className="p-2 rounded-sm text-white text-md font-semibolc shadow-sm shadow-zinc-800/60 hover:bg-zinc-200 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-background dark:text-zinc-300 dark:hover:bg-zinc-800">Korea Muslim Community</h2> */}
          <button onClick={close} className="text-white">
            <X className="w-8 h-8 size-6 p-0 rounded-sm shadow-sm shadow-zinc-800/60 hover:bg-zinc-200 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-background dark:text-zinc-300 dark:hover:bg-zinc-800" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-2">
          {SITE_NAV.map((item) => (
            <MobileMenu
              key={item.label}
              item={item}
              pathname={pathname}
              searchParams={searchParams}
              close={close}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-white/30" />

        {/* ✅ Download Button */}
        <DownloadMenu />
      </div>
    </>
  );
}

/* -------------------------
   HEADER
--------------------------*/
function HeaderInner({ user }: { user: Session["user"] | null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const close = () => setMobileOpen(false);

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <DesktopNav pathname={pathname} searchParams={searchParams} />

          {/* ✅ Download Button */}
          <div className="hidden md:block pl-4">
          <DownloadMenu />
          </div>
        

        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden">
          {mobileOpen ? <X /> : <Menu className="w-10 h-10 size-6 p-1 rounded-sm shadow-sm shadow-zinc-800/60 hover:bg-zinc-200 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-background dark:text-zinc-300 dark:hover:bg-zinc-800"/>}
        </button>
      </div>

      <MobileNav
        pathname={pathname}
        searchParams={searchParams}
        open={mobileOpen}
        close={close}
      />
    </>
  );
}

/* -------------------------
   EXPORT
--------------------------*/
export function ClientHeaderNav({ user }: { user: Session["user"] | null }) {
  const pathname = usePathname();

  return (
    <Suspense key={pathname}>
      <HeaderInner user={user} />
    </Suspense>
  );
}
