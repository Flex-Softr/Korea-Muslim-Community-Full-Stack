"use client";

import type { Session } from "next-auth";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { brandNavPillClass } from "@/components/layout/brand-nav-pill";
import { ClientUserMenu } from "@/components/layout/client-user-menu";
import { ModeToggle } from "@/components/layout/mode-toggle";
import {
  type SiteNavSubLink,
  type SiteNavSubmenu,
  SITE_NAV,
  isSubLinkActive,
  isSubmenuActive,
  isTopLinkActive,
} from "@/config/site-nav";
import { cn } from "@/lib/utils";

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
}: {
  entry: SiteNavSubmenu;
  pathname: string;
  searchParams: URLSearchParams | null;
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
        {entry.label}
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
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DesktopNav({
  pathname,
  searchParams,
}: {
  pathname: string;
  searchParams: URLSearchParams | null;
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
              label={entry.label}
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
}: {
  item: SiteNavSubLink;
  pathname: string;
  searchParams: URLSearchParams | null;
  onNavigate: () => void;
}) {
  const active = isSubLinkActive(pathname, searchParams, item);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={brandNavPillClass(active)}
    >
      {item.label}
    </Link>
  );
}

function MobileNav({
  pathname,
  searchParams,
  mobileOpen,
  closeMobile,
  user,
}: {
  pathname: string;
  searchParams: URLSearchParams | null;
  mobileOpen: boolean;
  closeMobile: () => void;
  user: Session["user"] | null;
}) {
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);

  const toggleSubmenu = (id: string) => {
    setOpenSubmenuId((cur) => (cur === id ? null : id));
  };

  return (
    <div
      id="mobile-site-nav"
      className={cn(
        "fixed inset-x-0 top-14 z-30 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-white/10 bg-[#2a74a8] px-4 py-4 shadow-lg lg:hidden",
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
                label={entry.label}
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
                <span>{entry.label}</span>
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
            Login
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

  const closeMobile = () => {
    setMobileOpen(false);
  };

  return (
    <>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2 lg:justify-between lg:gap-3">
        <DesktopNav pathname={pathname} searchParams={searchParams} />

        <div className="flex shrink-0 items-center gap-1 sm:gap-2 lg:gap-3">
          <ModeToggle onBrand />

          {user ? (
            <ClientUserMenu
              email={user.email ?? ""}
              name={user.name}
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
              Login
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
