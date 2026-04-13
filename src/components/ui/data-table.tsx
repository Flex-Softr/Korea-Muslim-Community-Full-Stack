"use client";

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
  emptyLabel = "No data found.",
  className,
}: {
  rows: T[];
  columns: Array<DataTableColumn<T>>;
  getRowId: (row: T) => string;
  emptyLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-border/80 shadow-md", className)}>
      <table className="w-full min-w-[56rem] text-sm">
        <thead>
          <tr className="border-b border-border bg-gray-100 text-left text-xs font-bold uppercase tracking-wide text-foreground">
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
            rows.map((row, idx) => (
              <tr
                key={getRowId(row)}
                className={cn(
                  "border-b border-border/60 transition-colors duration-200 hover:bg-indigo-50",
                  idx % 2 === 0 ? "bg-white" : "bg-slate-50/70",
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-2 py-2", col.cellClassName)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
