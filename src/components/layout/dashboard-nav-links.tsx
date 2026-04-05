"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown, LayoutDashboard, Settings, Shield } from "lucide-react";
import { hasAnyRole, type UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

const mainNav: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const adminNav: {
  href: string;
  label: string;
  icon: typeof Shield;
  roles: UserRole[];
}[] = [
  {
    href: "/dashboard/admin",
    label: "Admin",
    icon: Shield,
    roles: ["ADMIN", "SUPER_ADMIN"],
  },
  {
    href: "/dashboard/super-admin",
    label: "Super admin",
    icon: Crown,
    roles: ["SUPER_ADMIN"],
  },
];

export function DashboardNavLinks({
  role,
  onNavigate,
  className,
}: {
  role: UserRole;
  /** Close mobile drawer after navigation. */
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const extra = adminNav.filter((item) => hasAnyRole(role, item.roles));
  const nav = [mainNav[0], ...extra, mainNav[1]];

  return (
    <nav
      className={cn("flex flex-col gap-0.5 p-2", className)}
      aria-label="Dashboard"
    >
      {nav.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => onNavigate?.()}
            className={cn(
              "flex min-h-11 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors sm:min-h-0 sm:py-2",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
