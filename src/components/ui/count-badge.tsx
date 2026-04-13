"use client";

import { cn } from "@/lib/utils";

export function CountBadge({
  count,
  loading = false,
  className,
}: {
  count: number;
  loading?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
        "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
        loading ? "animate-pulse" : "",
        className,
      )}
      aria-label={loading ? "Loading pending users count" : `Pending users ${count}`}
    >
      {loading ? "..." : count}
    </span>
  );
}
