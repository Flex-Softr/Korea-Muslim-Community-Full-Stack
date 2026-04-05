"use client";

import type { Session } from "next-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClientUserMenu } from "@/components/layout/client-user-menu";
import { ModeToggle } from "@/components/layout/mode-toggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/contact", label: "Contact" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}

export function ClientHeaderNav({
  user,
}: {
  user: Session["user"] | null;
}) {
  return (
    <div className="flex flex-1 items-center justify-end gap-1 sm:gap-4">
      <nav className="mr-auto flex items-center gap-6 pl-6 sm:pl-10">
        {links.map((l) => (
          <NavLink key={l.href} href={l.href} label={l.label} />
        ))}
      </nav>
      <ModeToggle />
      {user ? (
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Dashboard
          </Link>
          <ClientUserMenu email={user.email ?? ""} name={user.name} />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Sign up
          </Link>
        </div>
      )}
    </div>
  );
}
