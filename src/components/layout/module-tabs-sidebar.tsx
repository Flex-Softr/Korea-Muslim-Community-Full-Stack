"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

export type ModuleTabsSidebarItem = {
  key: string;
  href: string;
  label?: string;
  labelKey?: string;
  icon: LucideIcon;
};

const SELECT_ARROW_STYLE = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
} as const;

export function ModuleTabsSidebar({
  title,
  titleKey,
  subtitle,
  subtitleKey,
  tabs,
  activeKey,
  selectId,
  ariaLabel,
}: {
  title?: string;
  titleKey?: string;
  subtitle?: string;
  subtitleKey?: string;
  tabs: ModuleTabsSidebarItem[];
  activeKey: string;
  selectId: string;
  ariaLabel: string;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const tt = t as unknown as (key: string) => string;

  const resolveLabel = (tab: ModuleTabsSidebarItem) =>
    tab.labelKey ? tt(tab.labelKey) : (tab.label ?? tab.key);

  const resolvedTitle = titleKey ? tt(titleKey) : (title ?? "");
  const resolvedSubtitle = subtitleKey
    ? tt(subtitleKey)
    : (subtitle ?? "");

  const onMobileTabChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = tabs.find((tab) => tab.key === event.target.value);
    if (!next) return;
    router.push(next.href, { scroll: false });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold">{resolvedTitle}</h2>
        {resolvedSubtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{resolvedSubtitle}</p>
        ) : null}
      </div>

      <div className="p-3 lg:hidden">
        <label htmlFor={selectId} className="sr-only">
          {resolvedTitle}
        </label>
        <select
          id={selectId}
          value={activeKey}
          onChange={onMobileTabChange}
          className="h-11 w-full appearance-none rounded-md border border-input bg-background bg-[length:1rem] bg-[position:right_0.75rem_center] bg-no-repeat pe-10 ps-3 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c7bb6]/50"
          style={SELECT_ARROW_STYLE}
        >
          {tabs.map((tab) => (
            <option key={tab.key} value={tab.key}>
              {resolveLabel(tab)}
            </option>
          ))}
        </select>
      </div>

      <nav aria-label={ariaLabel} className="hidden flex-col gap-1 p-3 lg:flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeKey === tab.key;

          return (
            <Link
              key={tab.key}
              href={tab.href}
              scroll={false}
              className={cn(
                "inline-flex min-h-11 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#2c7bb6] text-white shadow-sm"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="line-clamp-2 text-left">{resolveLabel(tab)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
