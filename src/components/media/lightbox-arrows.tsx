"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LightboxArrowButton({
  direction,
  onClick,
  label,
  className,
  disabled,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
  className?: string;
  disabled?: boolean;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      disabled={disabled}
      className={cn(
        "size-10 shrink-0 rounded-full shadow-md sm:size-11",
        className,
      )}
      onClick={onClick}
      aria-label={label}
    >
      <Icon className="size-5" aria-hidden />
    </Button>
  );
}
