"use client";

import { cn } from "@/lib/utils";

export function FormMessage({
  type = "error",
  children,
  className,
}: {
  type?: "error" | "success";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn(type === "success" ? "form-message-success" : "form-message-error", className)}>
      {children}
    </p>
  );
}
