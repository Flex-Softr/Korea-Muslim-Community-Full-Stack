"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clampPage, getPaginationItems } from "@/lib/pagination/get-pagination-items";
import { cn } from "@/lib/utils";

type ReusablePaginationProps = {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
};

export function ReusablePagination({
  currentPage,
  totalPages,
  onChange,
  className,
}: ReusablePaginationProps) {
  const safeTotal = Math.max(1, Math.floor(totalPages || 1));
  const safePage = clampPage(currentPage || 1, safeTotal);
  const [jumpValue, setJumpValue] = React.useState(String(safePage));

  React.useEffect(() => {
    setJumpValue(String(safePage));
  }, [safePage]);

  if (safeTotal <= 1) return null;

  const items = getPaginationItems(safePage, safeTotal, 1);

  const goTo = (next: number) => {
    const page = clampPage(next, safeTotal);
    if (page !== safePage) onChange(page);
  };

  const submitJump = () => {
    const parsed = Number.parseInt(jumpValue, 10);
    if (Number.isNaN(parsed)) {
      setJumpValue(String(safePage));
      return;
    }
    goTo(parsed);
  };

  return (
    <nav
      className={cn("flex w-full flex-wrap items-center justify-between gap-3", className)}
      aria-label="Pagination"
    >
      <div className="flex flex-wrap items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => goTo(1)}
          disabled={safePage <= 1}
        >
          First
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => goTo(safePage - 1)}
          disabled={safePage <= 1}
        >
          Previous
        </Button>

        {items.map((item, idx) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-sm text-muted-foreground">
              ...
            </span>
          ) : (
            <Button
              key={item}
              type="button"
              variant={item === safePage ? "default" : "outline"}
              size="sm"
              onClick={() => goTo(item)}
              aria-current={item === safePage ? "page" : undefined}
              className={cn(item === safePage && "pointer-events-none")}
            >
              {item}
            </Button>
          ),
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => goTo(safePage + 1)}
          disabled={safePage >= safeTotal}
        >
          Next
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => goTo(safeTotal)}
          disabled={safePage >= safeTotal}
        >
          Last
        </Button>
      </div>

      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submitJump();
        }}
      >
        <label className="sr-only" htmlFor="reusable-pagination-jump">
          Jump to page
        </label>
        <Input
          id="reusable-pagination-jump"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          onBlur={submitJump}
          className="h-8 w-16 text-center"
          aria-label="Jump to page"
        />
        <span className="text-xs text-muted-foreground">/ {safeTotal}</span>
        <Button type="submit" variant="secondary" size="sm">
          Go
        </Button>
      </form>
    </nav>
  );
}
