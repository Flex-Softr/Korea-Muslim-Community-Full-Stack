"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: T) => React.ReactNode;
};

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  renderExpandedRow,
  expandButtonLabel = "Toggle row details",
  onExpandedChange,
  emptyLabel = "No data found.",
  className,
}: {
  rows: T[];
  columns: Array<DataTableColumn<T>>;
  getRowId: (row: T) => string;
  renderExpandedRow?: (row: T) => React.ReactNode;
  expandButtonLabel?: string;
  onExpandedChange?: (row: T, expanded: boolean) => void;
  emptyLabel?: string;
  className?: string;
}) {
  const [expandedRowIds, setExpandedRowIds] = useState<Record<string, boolean>>({});

  const toggleExpanded = (row: T) => {
    const rowId = getRowId(row);
    const nextExpanded = !Boolean(expandedRowIds[rowId]);
    setExpandedRowIds((prev) => ({ ...prev, [rowId]: nextExpanded }));
    onExpandedChange?.(row, nextExpanded);
  };

  const hasExpandableRows = typeof renderExpandedRow === "function";

  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-md", className)}>
      <table className="w-full min-w-[56rem] text-sm">
        <thead>
          <tr className="border-b border-border/80 bg-muted/70 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {hasExpandableRows ? <th className="w-10 px-2 py-2" aria-label="Expand row" /> : null}
            {columns.map((col) => (
              <th key={col.key} className={cn("px-2 py-2", col.headerClassName)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-2 py-8 text-center text-muted-foreground">
                {emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => {
              const rowId = getRowId(row);
              const isExpanded = Boolean(expandedRowIds[rowId]);

              return (
                <Fragment key={rowId}>
                  <tr
                    className={cn(
                      "border-b border-border/60 text-foreground transition-colors duration-200 hover:bg-muted/60",
                      idx % 2 === 0 ? "bg-background" : "bg-muted/30",
                    )}
                  >
                    {hasExpandableRows ? (
                      <td className="px-2 py-2 align-top">
                        <button
                          type="button"
                          onClick={() => toggleExpanded(row)}
                          aria-expanded={isExpanded}
                          aria-label={expandButtonLabel}
                          className="inline-flex size-7 items-center justify-center rounded-md border border-border/80 bg-background text-muted-foreground transition hover:text-foreground"
                        >
                          {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                        </button>
                      </td>
                    ) : null}
                    {columns.map((col) => (
                      <td key={col.key} className={cn("px-2 py-2", col.cellClassName)}>
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                  {hasExpandableRows && isExpanded ? (
                    <tr className={cn("border-b border-border/60", idx % 2 === 0 ? "bg-background" : "bg-muted/30")}>
                      <td colSpan={columns.length + 1} className="px-3 py-3">
                        <div className="rounded-lg border border-border/70 bg-muted/40 p-3">{renderExpandedRow(row)}</div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
