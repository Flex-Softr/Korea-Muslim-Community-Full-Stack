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
        <div className="mx-auto max-w-4xl">
          <GeographyVisitorMap
            className="w-full"
            onStatsChange={handleStatsChange}
          />
        </div>
      </div>
    </section>
  );
}
