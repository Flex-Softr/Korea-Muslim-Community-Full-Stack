import type { Lang } from "@/lib/i18n/lang";
import { headerNavTextSizeClass } from "@/components/layout/header-nav-typography";
import { cn } from "@/lib/utils";

/** Shared pill styles for links in the blue client header / mobile drawer. */
export function brandNavPillClass(active: boolean, lang: Lang) {
  return cn(
    "inline-flex items-center gap-0.5 whitespace-nowrap rounded-md px-2 py-1 font-medium transition-colors lg:px-2.5 lg:py-1.5",
    headerNavTextSizeClass(lang),
    active
      ? "bg-[#4a9fd4] text-white shadow-sm"
      : "text-white/95 hover:bg-white/10",
  );
}
