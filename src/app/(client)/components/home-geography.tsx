"use client";

import { useCallback, useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import {
  formatVisitors,
  GeographyVisitorMap,
} from "@/components/maps/geography-visitor-map";
import type { VisitorByCountry } from "@/lib/services/visitor-history";

type MapStats = {
  totalVisitors: number;
  countryCount: number;
  topCountries: VisitorByCountry[];
  loading: boolean;
};

export function HomeGeography() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<MapStats>({
    totalVisitors: 0,
    countryCount: 0,
    topCountries: [],
    loading: true,
  });

  const handleStatsChange = useCallback((next: MapStats) => {
    setStats(next);
  }, []);

  return (
    <section
      className="border-b border-border/40 bg-background"
      aria-labelledby="home-geography-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
        <div className="grid items-center gap-8 md:grid-cols-12 md:gap-8 lg:gap-10">
          {/* Left copy */}
          <div className="md:col-span-4 lg:col-span-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[#2c7bb6] dark:text-sky-400">
              {t("homeGeography.eyebrow")}
            </p>
            <h2
              id="home-geography-heading"
              className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
            >
              {t("homeGeography.title")}
            </h2>

            <div className="mt-6 flex flex-wrap gap-5">
              <div>
                <p className="text-xl font-semibold tracking-tight text-foreground">
                  {stats.loading ? "—" : formatVisitors(stats.totalVisitors)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("homeGeography.totalLabel")}
                </p>
              </div>
              <div>
                <p className="text-xl font-semibold tracking-tight text-foreground">
                  {stats.loading ? "—" : formatVisitors(stats.countryCount)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("homeGeography.countriesLabel")}
                </p>
              </div>
            </div>

            {!stats.loading && stats.topCountries.length > 0 ? (
              <ul className="mt-6 space-y-1.5 border-t border-border/50 pt-4">
                {stats.topCountries.map((row) => (
                  <li
                    key={row.countryId}
                    className="flex items-center justify-between gap-3 text-xs sm:text-sm"
                  >
                    <span className="font-medium text-foreground">
                      {row.country}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatVisitors(row.activeUsers)}{" "}
                      {t("homeGeography.visitorsLabel")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Right map — larger */}
          <div className="md:col-span-8 lg:col-span-8">
            <GeographyVisitorMap
              className="w-full"
              onStatsChange={handleStatsChange}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
