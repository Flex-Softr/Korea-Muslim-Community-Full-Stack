"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  ChevronDown,
  ChevronRight,
  User,
  FileText,
  Clock3,
  Activity,
  FolderKanban,
  Image as ImageIcon,
  Images,
  Video,
  Users,
  UserCheck,
} from "lucide-react";
import { hasMinimumRole, type UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { CountBadge } from "@/components/ui/count-badge";
import { onPendingUsersChanged } from "@/lib/dashboard-events";

const navItems: Array<
  | {
      type: "link";
      href: string;
      label: string;
      icon?: typeof LayoutDashboard;
      adminOnly?: boolean;
    }
  | {
      type: "group";
      label: string;
      icon: typeof LayoutDashboard;
      children: Array<{
        href: string;
        label: string;
        icon: typeof LayoutDashboard;
        adminOnly?: boolean;
      }>;
    }
> = [
  
  {
    type: "group",
    label: "Blogs",
    icon: FileText,
    children: [
      { href: "/dashboard/content/blog/blogs", label: "All Blogs", icon: FileText },
      { href: "/dashboard/blogs/pending", label: "Pending Blogs", icon: Clock3, adminOnly: true },
    ],
  },
  {
    type: "group",
    label: "Activity",
    icon: Activity,
    children: [
      { href: "/dashboard/content/activity/activities", label: "All Activities", icon: Activity },
      { href: "/dashboard/content/activity/categories", label: "Categories", icon: FolderKanban }
    ],
  },
  {
    type: "group",
    label: "Photo Gallery",
    icon: ImageIcon,
    children: [
      { href: "/dashboard/content/photo-gallery/photos", label: "All Photos", icon: ImageIcon },
      { href: "/dashboard/content/photo-gallery/categories", label: "Categories", icon: FolderKanban },
    ],
  },
  {
    type: "group",
    label: "Video Gallery",
    icon: Video,
    children: [
      { href: "/dashboard/content/video-gallery/videos", label: "All Videos", icon: Video },
      { href: "/dashboard/content/video-gallery/categories", label: "Categories", icon: FolderKanban },
    ],
  },
  {
    type: "group",
    label: "Users",
    icon: Users,
    children: [
      { href: "/dashboard/users", label: "All Users", icon: Users, adminOnly: true },
      { href: "/dashboard/users/pending", label: "Pending Users", icon: UserCheck, adminOnly: true },
    ],
  },
  { type: "link", href: "/dashboard", label: "Profile", icon: User },
  { type: "link", href: "/dashboard/carosal", label: "Carousel Slider", icon: Images, adminOnly: true },

  { type: "link", href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export function DashboardNavLinks({
  role,
  collapsed = false,
  onNavigate,
  className,
}: {
  role: UserRole;
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const isAdmin = hasMinimumRole(role, "ADMIN");
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const [pendingUsersLoading, setPendingUsersLoading] = useState(isAdmin);
  const visibleItems = navItems
    .map((item) => {
      if (item.type === "link") {
        if (item.adminOnly && !isAdmin) return null;
        return item;
      }
      const children = item.children.filter((child) => !(child.adminOnly && !isAdmin));
      if (children.length === 0) return null;
      return { ...item, children };
    })
    .filter(Boolean) as typeof navItems;

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    const loadPendingCount = async () => {
      setPendingUsersLoading(true);
      try {
        const res = await fetch("/api/dashboard/users?status=pending&count=true", { cache: "no-store" });
        const data = (await res.json()) as { count?: number };
        if (!res.ok || !active) return;
        setPendingUsersCount(Number.isFinite(data.count) ? Number(data.count) : 0);
      } finally {
        if (active) setPendingUsersLoading(false);
      }
    };
    void loadPendingCount();
    const off = onPendingUsersChanged(() => {
      void loadPendingCount();
    });
    return () => {
      active = false;
      off();
    };
  }, [isAdmin, pathname]);

  // Create open state for groups, use map from label to boolean
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => {
    // Open any group that contains an active link by default
    const initialState: Record<string, boolean> = {};
    visibleItems.forEach((item) => {
      if (item.type === "group") {
        initialState[item.label] =
          item.children.some((child) => pathname.startsWith(child.href));
      }
    });
    return initialState;
  });

  const handleToggleGroup = (label: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <nav className={cn("flex flex-col gap-1.5 p-2.5 sm:p-3", className)} aria-label="Dashboard">
      {visibleItems.map((item, idx) => {
        if (item.type === "link") {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              title={collapsed ? item.label : undefined}
              onClick={() => onNavigate?.()}
              className={cn(
                "relative flex min-h-11 items-center rounded-xl text-sm font-medium transition-all duration-200 ease-out sm:min-h-0 sm:py-2",
                collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2.5",
                isActive
                  ? "rounded-xl bg-white/14 font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                  : "text-white/80 hover:bg-white/8 hover:text-white"
              )}
            >
              {isActive ? <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-white/80" /> : null}
              {Icon ? <Icon className={cn("size-4 shrink-0", isActive ? "opacity-100" : "opacity-80")} aria-hidden /> : null}
              {!collapsed ? <span className="min-w-0 truncate">{item.label}</span> : null}
            </Link>
          );
        }
        // type === "group"
        const isOpen = !!openGroups[item.label];
        const GroupIcon = item.icon;
        // If any child is active, treat group as open for the chevron
        const isAnyChildActive = item.children.some((child) =>
          pathname.startsWith(child.href)
        );
        return (
          <div key={item.label} className="space-y-0.5">
            <button
              type="button"
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex w-full rounded-xl text-sm font-semibold text-white/85 select-none transition-all duration-200 ease-out hover:bg-white/8 hover:text-white",
                collapsed ? "items-center justify-center px-0 py-2.5" : "items-center gap-2 px-3 py-2.5",
                isAnyChildActive && !isOpen
                  ? "bg-white/8 text-white"
                  : ""
              )}
              aria-expanded={isOpen}
              onClick={() => handleToggleGroup(item.label)}
            >
              <GroupIcon className="size-4 shrink-0 opacity-85" aria-hidden />
              {!collapsed ? (
                <>
                  <span className="min-w-0 flex-1 text-left truncate">{item.label}</span>
                  <span>
                    {isOpen ? (
                      <ChevronDown className="size-4 opacity-80" aria-hidden />
                    ) : (
                      <ChevronRight className="size-4 opacity-80" aria-hidden />
                    )}
                  </span>
                </>
              ) : null}
            </button>
            {isOpen && !collapsed && (
              <div className="animate-in fade-in zoom-in-95 ml-3 space-y-1 border-l border-white/10 pl-3 duration-200">
                {item.children.map((child) => {
                  const isActive = pathname.startsWith(child.href);
                  const ChildIcon = child.icon;
                  return (
                    <Link
                      key={`${item.label}-${child.href}-${child.label}`}
                      href={child.href}
                      onClick={() => onNavigate?.()}
                      className={cn(
                        "relative flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all duration-200 ease-out",
                        isActive
                          ? "bg-white/14 font-semibold text-white"
                          : "text-white/80 hover:bg-white/8 hover:text-white",
                      )}
                    >
                      {isActive ? <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-white/80" /> : null}
                      <span className="flex min-w-0 items-center gap-2.5">
                        <ChildIcon className={cn("size-4 shrink-0", isActive ? "opacity-100" : "opacity-80")} />
                        <span className="truncate">{child.label}</span>
                        {child.href === "/dashboard/users/pending" ? (
                          <CountBadge count={pendingUsersCount} loading={pendingUsersLoading} />
                        ) : null}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
