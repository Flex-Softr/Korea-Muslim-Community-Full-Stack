import type { Lang } from "@/lib/i18n/lang";
import { headerNavTextSizeClass } from "@/components/layout/header-nav-typography";

/** Shared desktop nav / download submenu styling */
export const flyoutPanel =
  "min-w-[200px] bg-[#2c7bb6] py-1 text-white shadow-lg outline-none";

export function flyoutRowClass(lang: Lang): string {
  return [
    "flex min-h-11 w-full items-center gap-2 whitespace-nowrap px-4 py-3 text-white transition-colors hover:bg-[#235d94] lg:min-h-12 lg:py-3.5",
    headerNavTextSizeClass(lang),
  ].join(" ");
}

/** Show direct child panel on hover/focus-within (arbitrary nesting). */
export const revealDirectUl =
  "[&:hover>ul]:pointer-events-auto [&:hover>ul]:visible [&:hover>ul]:opacity-100 [&:focus-within>ul]:pointer-events-auto [&:focus-within>ul]:visible [&:focus-within>ul]:opacity-100";

export const flyoutStartHidden =
  "invisible opacity-0 pointer-events-none transition-opacity duration-150";

export const flyoutBranchTint =
  "bg-[#235d94]/35 hover:bg-[#235d94]";
