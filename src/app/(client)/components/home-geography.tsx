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
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
          {/* Left side — stats */}
          <div className="shrink-0 lg:w-85">
            <p className="text-sm font-medium uppercase tracking-wider text-primary/80">
              {t("homeGeography.eyebrow")}
            </p>
            <h2
              id="home-geography-heading"
              className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              {t("homeGeography.title")}
            </h2>

            <div className="mt-6 flex items-start gap-8">
              {/* Total visitors */}
              <div>
                <p className="text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
                  {stats.loading ? "—" : formatVisitors(stats.totalVisitors)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("homeGeography.totalLabel")}
                </p>
              </div>

              {/* Country count */}
              <div>
                <p className="text-3xl font-bold tabular-nums text-foreground sm:text-4xl">
                  {stats.loading ? "—" : stats.countryCount}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("homeGeography.countriesLabel")}
                </p>
              </div>
            </div>
          </div>

          {/* Right side — smaller map */}
          <div className="min-w-0 flex-1">
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
