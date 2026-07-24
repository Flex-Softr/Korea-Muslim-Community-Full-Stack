"use client";

import { ModuleTabsSidebar } from "@/components/layout/module-tabs-sidebar";
import {
  resolveParentModule,
  tabHref,
} from "@/lib/module-sections/config";

export function ParentModuleSidebar({
  category,
  selectId = "parent-module-tab-select",
}: {
  category: string;
  selectId?: string;
}) {
  const resolved = resolveParentModule(category);
  if (!resolved) return null;

  const { module, activeTabKey } = resolved;

  return (
    <ModuleTabsSidebar
      titleKey={module.sidebarTitleKey}
      subtitleKey={module.sidebarSubtitleKey}
      activeKey={activeTabKey}
      selectId={selectId}
      ariaLabel={`${module.id} sections`}
      tabs={module.tabs.map((tab) => ({
        key: tab.key,
        href: tabHref(module.basePath, tab.key),
        label: tab.label,
        labelKey: tab.labelKey,
        icon: tab.icon,
      }))}
    />
  );
}
