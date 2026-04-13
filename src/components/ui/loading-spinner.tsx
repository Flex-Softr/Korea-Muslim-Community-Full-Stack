"use client";

import { cn } from "@/lib/utils";

export function LoadingSpinner({
  label = "Loading...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground", className)}>
      <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      <span>{label}</span>
    </div>
  );
}
