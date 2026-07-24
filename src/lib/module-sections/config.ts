import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  ExternalLink,
  FileText,
  GraduationCap,
  Landmark,
  Smartphone,
  Users,
} from "lucide-react";

export type ParentModuleId = "eps" | "students" | "education" | "mosque";

export type ParentModuleTab = {
  key: string;
  category: string;
  label?: string;
  labelKey?: string;
  icon: LucideIcon;
};

export type ParentModuleConfig = {
  id: ParentModuleId;
  basePath: string;
  sidebarTitleKey: string;
  sidebarSubtitleKey: string;
  parentLabelKey: string;
  tabs: ParentModuleTab[];
};

export const PARENT_MODULES: Record<ParentModuleId, ParentModuleConfig> = {
  eps: {
    id: "eps",
    basePath: "/eps",
    sidebarTitleKey: "pages.eps.sidebarTitle",
    sidebarSubtitleKey: "pages.eps.sidebarSubtitle",
    parentLabelKey: "breadcrumbs.eps",
    tabs: [
      { key: "form", category: "EPS - Form", labelKey: "nav.epsForm", icon: FileText },
      { key: "link", category: "EPS - Link", labelKey: "nav.epsLink", icon: ExternalLink },
      { key: "app", category: "EPS - App", labelKey: "nav.epsApp", icon: Smartphone },
    ],
  },
  students: {
    id: "students",
    basePath: "/students",
    sidebarTitleKey: "pages.students.sidebarTitle",
    sidebarSubtitleKey: "pages.students.sidebarSubtitle",
    parentLabelKey: "nav.students",
    tabs: [
      { key: "overview", category: "Students - Overview", label: "Overview", icon: GraduationCap },
      { key: "admission", category: "Students - Admission", label: "Admission", icon: ClipboardList },
      { key: "classes", category: "Students - Classes", label: "Classes", icon: BookOpen },
      { key: "events", category: "Students - Events", label: "Events", icon: CalendarDays },
      { key: "support", category: "Students - Support", label: "Support", icon: Users },
      { key: "resources", category: "Students - Resources", label: "Resources", icon: FileText },
    ],
  },
  education: {
    id: "education",
    basePath: "/education",
    sidebarTitleKey: "pages.education.sidebarTitle",
    sidebarSubtitleKey: "pages.education.sidebarSubtitle",
    parentLabelKey: "nav.education",
    tabs: [
      { key: "overview", category: "Education - Overview", label: "Overview", icon: GraduationCap },
      { key: "classes", category: "Education - Classes", label: "Classes", icon: BookOpen },
      { key: "events", category: "Education - Events", label: "Events", icon: CalendarDays },
      { key: "resources", category: "Education - Resources", label: "Resources", icon: FileText },
    ],
  },
  mosque: {
    id: "mosque",
    basePath: "/mosque",
    sidebarTitleKey: "pages.mosque.sidebarTitle",
    sidebarSubtitleKey: "pages.mosque.sidebarSubtitle",
    parentLabelKey: "nav.mosque",
    tabs: [
      {
        key: "mosque",
        category: "Mosque - Mosque",
        label: "বায়তুল ফালাহ মসজিদ এন্ড ইসলামিক সেন্টার",
        icon: Landmark,
      },
      {
        key: "korea-mosques",
        category: "Mosque - Korea Mosques",
        label: "কোরিয়ার মসজিদ সমূহ",
        icon: Building2,
      },
    ],
  },
};

export function resolveParentModule(category: string | null | undefined): {
  module: ParentModuleConfig;
  activeTabKey: string;
} | null {
  const normalized = (category ?? "").trim().toLowerCase();
  if (!normalized) return null;

  for (const module of Object.values(PARENT_MODULES)) {
    const matched = module.tabs.find(
      (tab) => tab.category.toLowerCase() === normalized,
    );
    if (matched) {
      return { module, activeTabKey: matched.key };
    }
  }

  // Fallback: match by module prefix (e.g. "EPS", "Students")
  for (const module of Object.values(PARENT_MODULES)) {
    const prefix = module.tabs[0]?.category.split(" - ")[0]?.toLowerCase();
    if (prefix && (normalized === prefix || normalized.startsWith(`${prefix} -`))) {
      return { module, activeTabKey: module.tabs[0].key };
    }
  }

  // Legacy mosque category name
  if (normalized === "mosque - our mosque") {
    return {
      module: PARENT_MODULES.mosque,
      activeTabKey: "mosque",
    };
  }

  return null;
}

export function tabHref(basePath: string, tabKey: string): string {
  return `${basePath}?tab=${encodeURIComponent(tabKey)}`;
}
