"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  clampPage,
  getPaginationItems,
} from "@/lib/pagination/get-pagination-items";

export { getPaginationItems, clampPage } from "@/lib/pagination/get-pagination-items";

export function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      role="presentation"
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center text-sm text-muted-foreground",
        className,
      )}
      {...props}
    >
      …
    </span>
  );
}

export type PageButtonRenderContext = {
  page: number;
  active: boolean;
  disabled: boolean;
  onSelect: () => void;
};

export type DataPaginationProps = {
  /** Current page (1-based). */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  /** `nav` label for screen readers. */
  ariaLabel?: string;
  disabled?: boolean;
  /** Pages adjacent to current before ellipsis (default 1). */
  siblingCount?: number;
  /** Show first / last page with ellipsis when needed (built into `getPaginationItems`). */
  showPrevNext?: boolean;
  previousLabel?: React.ReactNode;
  nextLabel?: React.ReactNode;
  /** “Page X of Y” (or custom). */
  showSummary?: boolean;
  summaryFormatter?: (page: number, totalPages: number) => string;
  /** Number input + go button. */
  showPageJump?: boolean;
  jumpButtonLabel?: string;
  jumpInputPlaceholder?: string;
  jumpAriaLabel?: string;
  /** Smaller controls. */
  size?: "default" | "sm";
  /** Layout alignment for the outer `nav` content. */
  align?: "start" | "center" | "end" | "between";
  /** Replace default numeric page buttons. */
  renderPageButton?: (
    page: number,
    ctx: PageButtonRenderContext,
  ) => React.ReactNode;
  /** Replace default ellipsis. */
  renderEllipsis?: (key: React.Key) => React.ReactNode;
  /** Extra class for the row of prev/page/next buttons. */
  pageListClassName?: string;
  /** Extra class for the jump row. */
  jumpClassName?: string;
  /** If true, render nothing when `totalPages <= 1`. @default true */
  hideWhenSinglePage?: boolean;
};

const sizeClasses = {
  default: {
    btn: "size-8 min-w-8 p-0 text-sm" as const,
    icon: "size-4" as const,
  },
  sm: {
    btn: "size-7 min-w-7 p-0 text-xs" as const,
    icon: "size-3.5" as const,
  },
};

function defaultSummary(page: number, totalPages: number) {
  return `Page ${page} of ${totalPages}`;
}

/**
 * Full-featured pagination: prev/next, condensed page list with ellipses, optional summary and page jump.
 * Fully controlled — pair with `usePagination` or URL `searchParams`.
 */
export function DataPagination({
  page,
  totalPages,
  onPageChange,
  className,
  ariaLabel = "Pagination",
  disabled = false,
  siblingCount = 1,
  showPrevNext = true,
  previousLabel,
  nextLabel,
  showSummary = false,
  summaryFormatter = defaultSummary,
  showPageJump = true,
  jumpButtonLabel = "Go",
  jumpInputPlaceholder = "Page #",
  jumpAriaLabel = "Jump to page",
  size = "default",
  align = "center",
  renderPageButton,
  renderEllipsis,
  pageListClassName,
  jumpClassName,
  hideWhenSinglePage = true,
}: DataPaginationProps) {
  const rawTotal = Math.floor(totalPages);
  const validTotal = Number.isFinite(rawTotal) && rawTotal >= 1;
  const safeTotal = validTotal ? rawTotal : 1;
  const safePage = clampPage(page, safeTotal);
  const shouldHide =
    !validTotal || (hideWhenSinglePage && safeTotal <= 1);

  const goTo = React.useCallback(
    (p: number) => {
      if (disabled || shouldHide || !validTotal) {
        return;
      }
      const next = clampPage(p, safeTotal);
      if (next !== safePage) {
        onPageChange(next);
      }
    },
    [
      disabled,
      onPageChange,
      safePage,
      safeTotal,
      shouldHide,
      validTotal,
    ],
  );

  if (shouldHide) {
    return null;
  }

  const items = getPaginationItems(safePage, safeTotal, siblingCount);
  const sz = sizeClasses[size];

  const alignNav =
    align === "start"
      ? "items-stretch sm:items-center sm:justify-start"
      : align === "end"
        ? "items-stretch sm:items-center sm:justify-end"
        : align === "between"
          ? "items-stretch sm:flex-row sm:items-center sm:justify-between"
          : "items-stretch sm:items-center sm:justify-center";

  return (
    <nav
      aria-label={ariaLabel}
      className={cn("flex w-full flex-col gap-3", alignNav, className)}
    >
      {showSummary ? (
        <p className="text-sm text-muted-foreground sm:shrink-0">
          {summaryFormatter(safePage, safeTotal)}
        </p>
      ) : null}

      <div
        className={cn(
          "flex w-full min-w-0 flex-row flex-wrap items-center gap-x-4 gap-y-2",
          align === "start"
            ? "justify-start"
            : align === "end"
              ? "justify-end"
              : align === "between" && !showSummary
                ? "justify-between"
                : "justify-center",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 flex-wrap items-center gap-1",
            align === "start"
              ? "justify-start"
              : align === "end"
                ? "justify-end"
                : "justify-center",
            pageListClassName,
          )}
        >
          {showPrevNext ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={disabled || safePage <= 1}
              aria-label="Previous page"
              className={sz.btn}
              onClick={() => goTo(safePage - 1)}
            >
              {previousLabel ?? (
                <ChevronLeft className={sz.icon} aria-hidden />
              )}
            </Button>
          ) : null}

          {items.map((item, index) => {
            if (item === "ellipsis") {
              return (
                renderEllipsis?.(`ellipsis-${index}`) ?? (
                  <PaginationEllipsis key={`ellipsis-${index}`} />
                )
              );
            }

            const p = item;
            const active = p === safePage;
            const ctx: PageButtonRenderContext = {
              page: p,
              active,
              disabled,
              onSelect: () => goTo(p),
            };

            if (renderPageButton) {
              return (
                <React.Fragment key={p}>
                  {renderPageButton(p, ctx)}
                </React.Fragment>
              );
            }

            return (
              <Button
                key={p}
                type="button"
                variant={active ? "default" : "outline"}
                size="icon"
                disabled={disabled}
                aria-label={`Page ${p}`}
                aria-current={active ? "page" : undefined}
                className={cn(sz.btn, active && "pointer-events-none")}
                onClick={ctx.onSelect}
              >
                {p}
              </Button>
            );
          })}

          {showPrevNext ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={disabled || safePage >= safeTotal}
              aria-label="Next page"
              className={sz.btn}
              onClick={() => goTo(safePage + 1)}
            >
              {nextLabel ?? (
                <ChevronRight className={sz.icon} aria-hidden />
              )}
            </Button>
          ) : null}
        </div>

        {showPageJump && safeTotal > 1 ? (
          <PaginationJump
            className={cn("shrink-0", jumpClassName)}
            align={align}
            disabled={disabled}
            page={safePage}
            totalPages={safeTotal}
            onJump={goTo}
            jumpButtonLabel={jumpButtonLabel}
            jumpInputPlaceholder={jumpInputPlaceholder}
            jumpAriaLabel={jumpAriaLabel}
            size={size}
          />
        ) : null}
      </div>
    </nav>
  );
}

type PaginationJumpProps = {
  page: number;
  totalPages: number;
  onJump: (page: number) => void;
  disabled?: boolean;
  jumpButtonLabel: string;
  jumpInputPlaceholder: string;
  jumpAriaLabel: string;
  size: "default" | "sm";
  align: DataPaginationProps["align"];
  className?: string;
};

function PaginationJump({
  page,
  totalPages,
  onJump,
  disabled,
  jumpButtonLabel,
  jumpInputPlaceholder,
  jumpAriaLabel,
  size,
  align,
  className,
}: PaginationJumpProps) {
  const [value, setValue] = React.useState(String(page));

  React.useEffect(() => {
    setValue(String(page));
  }, [page]);

  const submit = React.useCallback(() => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      setValue(String(page));
      return;
    }
    onJump(parsed);
    setValue(String(clampPage(parsed, totalPages)));
  }, [value, onJump, page, totalPages]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  const rowAlign =
    align === "end"
      ? "justify-end"
      : align === "start"
        ? "justify-start"
        : "justify-center";

  return (
    <form
      className={cn(
        "flex w-auto max-w-full flex-wrap items-center gap-2",
        rowAlign,
        className,
      )}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label className="sr-only" htmlFor="pagination-jump-input">
        {jumpAriaLabel}
      </label>
      <Input
        id="pagination-jump-input"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        disabled={disabled}
        placeholder={jumpInputPlaceholder}
        aria-label={jumpAriaLabel}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          const parsed = Number.parseInt(value, 10);
          if (Number.isNaN(parsed)) {
            setValue(String(page));
          }
        }}
        onKeyDown={onKeyDown}
        className={cn(
          "w-16 text-center",
          size === "sm" && "h-7 text-xs",
        )}
      />
      <span className="text-xs text-muted-foreground tabular-nums">
        / {totalPages}
      </span>
      <Button
        type="submit"
        variant="secondary"
        size={size === "sm" ? "sm" : "default"}
        disabled={disabled}
      >
        {jumpButtonLabel}
      </Button>
    </form>
  );
}

/** Low-level list item wrapper for fully custom layouts. */
export function PaginationItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}

/** Optional `ul` shell for semantic lists (compose with `PaginationItem`). */
export function PaginationList({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("flex flex-wrap items-center gap-1", className)}
      {...props}
    />
  );
}

/** Styled link-styled button for composition (e.g. with router `Link`). */
export function paginationTriggerClass(active: boolean) {
  return cn(
    buttonVariants({
      variant: active ? "default" : "outline",
      size: "icon",
    }),
    "size-8 min-w-8",
  );
}
