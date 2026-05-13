"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type LocalizedDetailCrumb = { label: string; href?: string };

/**
 * Full-width page header matching the primary blue brand bar (same layout as server PageBanner).
 */
export function LocalizedDetailBanner({
  breadcrumbs,
  title,
  subtitle,
  className,
}: {
  breadcrumbs: LocalizedDetailCrumb[];
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "relative overflow-hidden border-b border-white/10 bg-[#2c7bb6] text-white",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -32deg,
            transparent,
            transparent 12px,
            rgba(255, 255, 255, 0.04) 12px,
            rgba(255, 255, 255, 0.04) 13px
          )`,
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 md:py-14">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/80">
            {breadcrumbs.map((crumb, i) => (
              <li key={`${crumb.label}-${i}`} className="flex items-center gap-2">
                {i > 0 ? (
                  <ChevronRight className="size-3.5 shrink-0 opacity-60" aria-hidden />
                ) : null}
                {crumb.href ? (
                  <Link href={crumb.href} className="transition-colors hover:text-white">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium text-white" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.5rem] md:leading-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-white/90 sm:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
    </header>
  );
}
