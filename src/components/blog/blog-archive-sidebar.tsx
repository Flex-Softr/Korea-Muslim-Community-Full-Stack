"use client";

import { cn } from "@/lib/utils";

export type YearArchiveEntry = { year: number; count: number };

type BlogArchiveSidebarProps = {
  categories: string[];
  yearArchive: YearArchiveEntry[];
  selectedCategory: string | null;
  selectedYear: number | null;
  onSelectCategory: (category: string | null) => void;
  onSelectYear: (year: number | null) => void;
  totalMatching: number;
  className?: string;
};

export function BlogArchiveSidebar({
  categories,
  yearArchive,
  selectedCategory,
  selectedYear,
  onSelectCategory,
  onSelectYear,
  totalMatching,
  className,
}: BlogArchiveSidebarProps) {
  const hasFilters = selectedCategory != null || selectedYear != null;

  return (
    <aside
      className={cn(
        "space-y-8 rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm ring-1 ring-black/[0.03] dark:bg-card/50 dark:ring-white/[0.04] lg:sticky lg:top-24",
        className,
      )}
    >
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Browse
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {totalMatching === 0
            ? "No posts match these filters."
            : `${totalMatching} article${totalMatching === 1 ? "" : "s"}`}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              onSelectCategory(null);
              onSelectYear(null);
            }}
            className="mt-3 text-xs font-medium text-[#2c7bb6] underline-offset-4 hover:underline dark:text-sky-400"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      <div>
        <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Category
        </h3>
        <ul className="mt-3 flex flex-wrap gap-2" role="list">
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
              All
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

      <div>
        <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Archive by year
        </h3>
        <ul className="mt-3 space-y-1" role="list">
          <li>
            <button
              type="button"
              onClick={() => onSelectYear(null)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-colors",
                selectedYear === null
                  ? "bg-[#2c7bb6]/10 font-medium text-[#256fa3] dark:bg-sky-500/15 dark:text-sky-200"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              <span>All years</span>
            </button>
          </li>
          {yearArchive.map(({ year, count }) => (
            <li key={year}>
              <button
                type="button"
                onClick={() =>
                  onSelectYear(selectedYear === year ? null : year)
                }
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-colors",
                  selectedYear === year
                    ? "bg-[#2c7bb6]/10 font-medium text-[#256fa3] dark:bg-sky-500/15 dark:text-sky-200"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                )}
              >
                <span>{year}</span>
                <span className="tabular-nums text-xs opacity-70">{count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
