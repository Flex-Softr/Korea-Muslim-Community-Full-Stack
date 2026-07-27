"use client";

import { useEffect, useMemo, useState } from "react";
import worldMap from "@svg-maps/world";
import { useLanguage } from "@/components/providers/language-provider";
import {
  fetchVisitorHistory,
  type VisitorByCountry,
} from "@/lib/services/visitor-history";
import { cn } from "@/lib/utils";

const [VIEW_X, VIEW_Y, VIEW_W, VIEW_H] = worldMap.viewBox
  .split(/\s+/)
  .map(Number) as [number, number, number, number];

function formatVisitors(n: number): string {
  return new Intl.NumberFormat().format(n);
}

type ActiveCountry = {
  id: string;
  country: string;
  activeUsers: number;
  x: number;
  y: number;
};

type GeographyVisitorMapProps = {
  className?: string;
  compact?: boolean;
  onStatsChange?: (stats: {
    totalVisitors: number;
    countryCount: number;
    topCountries: VisitorByCountry[];
    loading: boolean;
  }) => void;
};

export function GeographyVisitorMap({
  className,
  compact = false,
  onStatsChange,
}: GeographyVisitorMapProps) {
  const { t } = useLanguage();
  const [visitors, setVisitors] = useState<VisitorByCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ActiveCountry | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchVisitorHistory();
        if (!cancelled) setVisitors(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const visitorsById = useMemo(() => {
    const map = new Map<string, VisitorByCountry>();
    for (const row of visitors) {
      if (!row.countryId) continue;
      map.set(row.countryId.toLowerCase(), row);
    }
    return map;
  }, [visitors]);

  const maxUsers = useMemo(() => {
    let max = 1;
    for (const row of visitors) {
      if (row.activeUsers > max) max = row.activeUsers;
    }
    return max;
  }, [visitors]);

  const totalVisitors = useMemo(
    () => visitors.reduce((sum, row) => sum + (row.activeUsers || 0), 0),
    [visitors],
  );

  useEffect(() => {
    onStatsChange?.({
      totalVisitors,
      countryCount: visitors.length,
      topCountries: [...visitors]
        .sort((a, b) => b.activeUsers - a.activeUsers)
        .slice(0, 5),
      loading,
    });
  }, [totalVisitors, visitors, loading, onStatsChange]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/60 bg-muted/20 shadow-sm ring-1 ring-black/3 dark:bg-muted/10 dark:ring-white/10",
        className,
      )}
      aria-label={t("homeGeography.mapLabel")}
    >
      <div
        className={cn(
          "mx-auto w-full",
          compact ? "max-w-md p-3 sm:max-w-lg sm:p-4" : "p-4 sm:p-5",
        )}
      >
        <div className="relative">
          <svg
            viewBox={worldMap.viewBox}
            className="relative z-0 h-auto w-full"
            role="img"
            aria-label={t("homeGeography.mapLabel")}
          >
            {worldMap.locations.map((location) => {
              const row = visitorsById.get(location.id.toLowerCase());
              const hasVisitors = Boolean(row && row.activeUsers > 0);
              const intensity = hasVisitors
                ? 0.16 + 0.42 * Math.sqrt((row!.activeUsers || 0) / maxUsers)
                : 0;
              const isActive = active?.id === location.id;

              return (
                <path
                  key={location.id}
                  d={location.path}
                  tabIndex={hasVisitors ? 0 : undefined}
                  role={hasVisitors ? "button" : undefined}
                  aria-label={
                    hasVisitors && row
                      ? `${row.country}: ${formatVisitors(row.activeUsers)} ${t("homeGeography.visitorsLabel")}`
                      : undefined
                  }
                  className={cn(
                    "outline-none transition-[fill,stroke,stroke-width]",
                    hasVisitors && "cursor-pointer",
                  )}
                  fill={
                    hasVisitors
                      ? `rgba(44, 123, 182, ${isActive ? Math.min(intensity + 0.15, 0.75) : intensity})`
                      : "rgba(148, 163, 184, 0.08)"
                  }
                  stroke={
                    hasVisitors
                      ? isActive
                        ? "rgba(44, 123, 182, 0.95)"
                        : "rgba(44, 123, 182, 0.65)"
                      : "rgba(100, 116, 139, 0.4)"
                  }
                  strokeWidth={hasVisitors ? (isActive ? 1.15 : 0.85) : 0.5}
                  vectorEffect="non-scaling-stroke"
                  onMouseEnter={(event) => {
                    if (!row) return;
                    try {
                      const bbox = event.currentTarget.getBBox();
                      setActive({
                        id: location.id,
                        country: row.country || location.name,
                        activeUsers: row.activeUsers,
                        x: bbox.x + bbox.width / 2,
                        y: bbox.y + bbox.height / 2,
                      });
                    } catch (error) {
                      console.error("[geography-map] bbox failed", error);
                    }
                  }}
                  onMouseLeave={() => setActive(null)}
                  onFocus={(event) => {
                    if (!row) return;
                    try {
                      const bbox = event.currentTarget.getBBox();
                      setActive({
                        id: location.id,
                        country: row.country || location.name,
                        activeUsers: row.activeUsers,
                        x: bbox.x + bbox.width / 2,
                        y: bbox.y + bbox.height / 2,
                      });
                    } catch (error) {
                      console.error("[geography-map] bbox failed", error);
                    }
                  }}
                  onBlur={() => setActive(null)}
                />
              );
            })}
          </svg>

          {active ? (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-lg bg-white px-3 py-2 text-left shadow-lg ring-1 ring-black/10"
              style={{
                left: `${((active.x - VIEW_X) / VIEW_W) * 100}%`,
                top: `${((active.y - VIEW_Y) / VIEW_H) * 100}%`,
              }}
              role="tooltip"
            >
              <p className="text-sm font-semibold leading-tight text-slate-900">
                {active.country}
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                {formatVisitors(active.activeUsers)}{" "}
                {t("homeGeography.visitorsLabel")}
              </p>
            </div>
          ) : null}

          {!loading && visitors.length === 0 ? (
            <p className="absolute inset-x-0 bottom-2 z-2 text-center text-xs text-muted-foreground">
              {t("homeGeography.empty")}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { formatVisitors };
