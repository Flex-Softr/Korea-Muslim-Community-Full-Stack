"use client";

import { cn } from "@/lib/utils";

type ActivityCategoryFilterProps = {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  className?: string;
  title?: string;
  allLabel?: string;
  clearLabel?: string;
  ariaLabel?: string;
};

export function ActivityCategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  className,
  title = "Filter by category",
  allLabel = "All",
  clearLabel = "Clear filter",
  ariaLabel = "Activity categories",
}: ActivityCategoryFilterProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {title}
          </p>
          <ul
            className="mt-2 flex max-w-full flex-wrap gap-2"
            role="list"
            aria-label={ariaLabel}
          >
            <li>
              <button
                type="button"
                onClick={() => onSelectCategory(null)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedCategory === null
                    ? "border-[#2c7bb6] bg-[#2c7bb6]/10 text-[#256fa3] dark:border-sky-500 dark:bg-sky-500/15 dark:text-sky-200"
                    : "border-border/80 bg-background text-muted-foreground hover:border-[#2c7bb6]/40 hover:text-foreground dark:hover:border-sky-500/40",
                )}
              >
                {allLabel}
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat}>
                <button
                  type="button"
                  onClick={() =>
                    onSelectCategory(selectedCategory === cat ? null : cat)
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    selectedCategory === cat
                      ? "border-[#2c7bb6] bg-[#2c7bb6]/10 text-[#256fa3] dark:border-sky-500 dark:bg-sky-500/15 dark:text-sky-200"
                      : "border-border/80 bg-background text-muted-foreground hover:border-[#2c7bb6]/40 hover:text-foreground dark:hover:border-sky-500/40",
                  )}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {selectedCategory != null ? (
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className="shrink-0 text-xs font-medium text-[#2c7bb6] underline-offset-4 hover:underline dark:text-sky-400"
          >
            {clearLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
