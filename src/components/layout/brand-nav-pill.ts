import { cn } from "@/lib/utils";

/** Shared pill styles for links in the blue client header / mobile drawer. */
export function brandNavPillClass(active: boolean) {
  return cn(
    "inline-flex items-center gap-0.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors sm:text-[0.9375rem]",
    active
      ? "bg-[#4a9fd4] text-white shadow-sm"
      : "text-white/95 hover:bg-white/10",
  );
}
