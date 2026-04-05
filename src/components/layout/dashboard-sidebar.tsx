"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown, LayoutDashboard, Settings, Shield } from "lucide-react";
import type { UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { hasAnyRole } from "@/lib/roles";

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

export function DashboardSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();

  const extra = adminNav.filter((item) => hasAnyRole(role, item.roles));

  const nav = [
    mainNav[0],
    ...extra,
    mainNav[1],
  ];

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <span className="text-sm font-semibold tracking-tight">Dashboard</span>
      </div>
      <nav className="flex flex-col gap-0.5 p-2">
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
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0 opacity-70" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
