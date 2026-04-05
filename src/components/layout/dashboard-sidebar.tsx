"use client";

import type { UserRole } from "@/lib/roles";
import { DashboardNavLinks } from "@/components/layout/dashboard-nav-links";

export function DashboardSidebar({ role }: { role: UserRole }) {
  return (
    <aside className="hidden h-full min-h-0 w-56 shrink-0 flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-4">
        <span className="text-sm font-semibold tracking-tight">Dashboard</span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <DashboardNavLinks role={role} />
      </div>
    </aside>
  );
}
