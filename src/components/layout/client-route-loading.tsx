import type { ComponentProps } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function BannerShimmer({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Skeleton shown while public `(client)` route Server Components fetch data.
 * Mirrors `PageBanner` (brand bar + typography rhythm) then a content grid.
 */
export function ClientRouteLoading() {
  return (
    <div
      className="flex min-h-[min(70vh,720px)] flex-col"
      aria-busy="true"
      role="status"
    >
      <span className="sr-only">Loading page</span>

      <header className="relative overflow-hidden border-b border-white/10 bg-[#2c7bb6] text-white">
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
          <div className="mb-4 flex flex-wrap items-center gap-2" aria-hidden>
            <BannerShimmer className="h-3.5 w-14 sm:w-16" />
            <span className="text-white/35" aria-hidden>
              ›
            </span>
            <BannerShimmer className="h-3.5 w-24 sm:w-32" />
            <span className="text-white/35" aria-hidden>
              ›
            </span>
            <BannerShimmer className="h-3.5 w-28 sm:w-36" />
          </div>
          <BannerShimmer className="h-9 w-full max-w-xl sm:h-10 sm:max-w-2xl md:h-11" />
          <div className="mt-4 max-w-2xl space-y-2.5">
            <BannerShimmer className="h-4 w-full sm:h-[1.125rem]" />
            <BannerShimmer className="h-4 w-[88%] sm:h-[1.125rem]" />
          </div>
        </div>
      </header>

      <div className="flex-1 bg-background">
        <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 md:py-12">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm"
              >
                <Skeleton className="aspect-[16/10] w-full rounded-none rounded-t-xl" />
                <div className="space-y-2.5 p-4">
                  <Skeleton className="h-4 w-3/4 max-w-[12rem]" />
                  <Skeleton className="h-3 w-full max-w-[10rem]" />
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto max-w-3xl space-y-3 rounded-xl border border-border/60 bg-card/50 p-6 shadow-sm sm:p-8">
            <Skeleton className="mx-auto h-2 w-16 rounded-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[94%]" />
            <Skeleton className="h-4 w-[78%]" />
            <div className="flex justify-center gap-2 pt-2">
              <Skeleton className="h-9 w-28 rounded-md" />
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
