"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";
import {
  BD_DIVISIONS,
  districtsForDivision,
} from "@/data/bangladesh-divisions-districts";
import { slugFromSearchParam } from "@/lib/members/config";
import { cn } from "@/lib/utils";

const selectCls =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-card";

export function MemberBdLocationFilters({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const divisionRaw = searchParams.get("division")?.trim() ?? "";
  const districtRaw = searchParams.get("district")?.trim() ?? "";
  const typeSlug = slugFromSearchParam(searchParams.get("type"));

  const districtOptions = useMemo(
    () => (divisionRaw ? districtsForDivision(divisionRaw) : []),
    [divisionRaw],
  );

  const pushQuery = (division: string, district: string) => {
    const q = new URLSearchParams(searchParams.toString());
    q.set("type", typeSlug);
    if (!division) {
      q.delete("division");
      q.delete("district");
    } else {
      q.set("division", division);
      if (district) {
        q.set("district", district);
      } else {
        q.delete("district");
      }
    }
    const qs = q.toString();
    startTransition(() => {
      router.replace(`/member?${qs}`, { scroll: false });
    });
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm ring-1 ring-black/[0.03] dark:bg-card/50 dark:ring-white/[0.04] sm:p-5",
        className,
      )}
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Filter by home region (Bangladesh)
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-foreground">Division</span>
          <select
            className={selectCls}
            value={divisionRaw}
            disabled={isPending}
            aria-label="Filter by Bangladesh division"
            onChange={(e) => {
              const v = e.target.value;
              pushQuery(v, "");
            }}
          >
            <option value="">All divisions</option>
            {BD_DIVISIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-foreground">District</span>
          <select
            className={selectCls}
            value={
              districtOptions.includes(districtRaw) ? districtRaw : ""
            }
            disabled={isPending || !divisionRaw}
            aria-label="Filter by district under selected division"
            onChange={(e) => {
              pushQuery(divisionRaw, e.target.value);
            }}
          >
            <option value="">
              {!divisionRaw
                ? "Select a division first"
                : "All districts in this division"}
            </option>
            {districtOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
