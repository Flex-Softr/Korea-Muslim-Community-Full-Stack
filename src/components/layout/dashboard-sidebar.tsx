"use client";

import { PanelLeftClose } from "lucide-react";
import { useEffect, useState } from "react";
import type { UserRole } from "@/lib/roles";
import { DashboardNavLinks } from "@/components/layout/dashboard-nav-links";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

export function DashboardSidebar({ role }: { role: UserRole }) {
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("dashboard-sidebar-collapsed");
    if (saved === "1") {
      const id = requestAnimationFrame(() => {
        setCollapsed(true);
      });
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem("dashboard-sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "hidden h-full min-h-0 shrink-0 flex-col border-e border-emerald-800/60 bg-gradient-to-b from-emerald-900 via-emerald-900 to-emerald-800 text-white transition-all duration-200 lg:flex lg:shadow-xl lg:backdrop-blur-sm",
        collapsed ? "w-[4.5rem]" : "w-[16rem] xl:w-[17rem]",
      )}
    >
      <div className={cn("flex h-18 shrink-0 items-center border-b border-white/10", collapsed ? "justify-center px-2" : "px-4")}>
        <span className="inline-flex items-center gap-3 rounded-xl bg-white/6 px-3 py-2">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-white/10 text-emerald-100">
            <span className="grid size-4 grid-cols-2 gap-0.5">
              <span className="rounded-[2px] bg-current" />
              <span className="rounded-[2px] bg-current" />
              <span className="rounded-[2px] bg-current" />
              <span className="rounded-[2px] bg-current" />
            </span>
          </span>
          {!collapsed ? (
            <span className="text-base font-semibold tracking-tight text-white">{t("dashboard.sidebarTitle")}</span>
          ) : null}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <DashboardNavLinks role={role} collapsed={collapsed} />
      </div>
      <div className={cn("space-y-2 border-t border-white/10 py-3", collapsed ? "px-2" : "px-3")}>
        <button
          type="button"
          title={collapsed ? t("dashboard.expandSidebar") : t("dashboard.collapseSidebar")}
          onClick={toggleCollapsed}
          className={cn(
            "flex h-10 w-full rounded-xl bg-white/6 text-sm font-medium text-white/90 transition-all duration-200 hover:bg-white/10",
            collapsed ? "items-center justify-center px-0" : "items-center gap-2 px-3",
          )}
        >
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-white/12">
            <PanelLeftClose className={cn("size-3.5 transition-transform duration-200", collapsed && "rotate-180")} aria-hidden />
          </span>
          {!collapsed ? t("dashboard.collapse") : null}
        </button>
      </div>
    </aside>
  );
}
