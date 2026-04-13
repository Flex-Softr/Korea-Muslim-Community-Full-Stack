"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardNavLinks } from "@/components/layout/dashboard-nav-links";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import type { UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function DashboardShell({
  role,
  email,
  name,
  children,
}: {
  role: UserRole;
  email: string;
  name?: string | null;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="dashboard-theme flex h-[100dvh] min-h-0 w-full flex-col overflow-hidden bg-background pt-[env(safe-area-inset-top)] lg:flex-row">
      <DashboardSidebar role={role} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <DashboardHeader
          email={email}
          name={name}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="animate-in fade-in min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 pb-[max(1rem,env(safe-area-inset-bottom))] duration-200 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
          {children}
        </main>
      </div>

      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent
          showCloseButton
          className={cn(
            "fixed start-0 top-0 z-50 flex h-[100dvh] max-h-none w-[min(19rem,calc(100vw-0.75rem))] max-w-none flex-col gap-0 rounded-none border-0 border-e border-emerald-800/60 bg-gradient-to-b from-emerald-900 via-emerald-900 to-emerald-800 p-0 text-white shadow-xl backdrop-blur-sm",
            "translate-x-0 translate-y-0",
          )}
        >
          <DialogTitle className="sr-only">Dashboard navigation</DialogTitle>
          <div className="flex h-16 shrink-0 items-center border-b border-white/15 px-5">
            <span className="text-base font-semibold tracking-tight text-white">
              Dashboard
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <DashboardNavLinks
              role={role}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
