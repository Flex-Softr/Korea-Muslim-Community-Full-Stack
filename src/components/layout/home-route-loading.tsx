import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Skeleton for `/` while hero, CMS lists, and galleries load.
 * Shapes follow `(client)/components` hero + stacked sections (no `PageBanner`).
 */
export function HomeRouteLoading() {
  return (
    <div className="flex flex-col" aria-busy="true" role="status">
      <span className="sr-only">Loading home</span>

      {/* Hero — same surface tokens as the rest of the home loader (background + muted), not fixed #f0f0f0 */}
      <section
        className="relative w-full overflow-hidden border-b border-border/40 bg-background"
        aria-hidden
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(44,123,182,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.08),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto h-[clamp(15rem,56vw,24rem)] w-full max-w-[1920px] sm:h-[clamp(13rem,32vw,22rem)] md:h-[clamp(13rem,24vw,24rem)]">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/60 via-muted/25 to-background animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/[0.06] via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6 md:p-8">
            <div className="mx-auto max-w-7xl space-y-2">
              <Skeleton className="h-6 w-[min(20rem,85%)] sm:h-8" />
              <Skeleton className="h-3.5 w-full max-w-2xl sm:h-4" />
              <Skeleton className="h-3 w-full max-w-xl sm:h-3.5" />
              <Skeleton className="mt-3 h-9 w-32 sm:h-10 sm:w-36" />
            </div>
          </div>
          <div className="absolute inset-0 z-20 flex items-center justify-between px-1 sm:px-3 md:px-5">
            <Skeleton className="size-8 rounded-sm sm:size-9 md:size-10" />
            <Skeleton className="size-8 rounded-sm sm:size-9 md:size-10" />
          </div>
          <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {[0, 1, 2].map((i) => (
              <Skeleton
                key={i}
                className={cn("h-1.5 rounded-full", i === 0 ? "w-5" : "w-2.5")}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Who we are — soft brand wash */}
      <section className="relative overflow-hidden border-b border-border/40 bg-background py-12 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(44,123,182,0.12),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl space-y-8 px-4 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-3 text-center">
            <Skeleton className="mx-auto h-8 w-48 max-w-[70%] sm:h-9" />
            <Skeleton className="mx-auto h-4 w-full max-w-lg" />
            <Skeleton className="mx-auto h-4 w-full max-w-md" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm"
              >
                <Skeleton className="mx-auto size-10 rounded-lg" />
                <Skeleton className="mt-3 h-4 w-4/5 mx-auto" />
                <Skeleton className="mt-2 h-3 w-full" />
                <Skeleton className="mt-1 h-3 w-[90%]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activity + blog style strips */}
      {[0, 1].map((block) => (
        <section
          key={block}
          className="border-b border-border/40 bg-muted/30 py-10 sm:py-12"
          aria-hidden
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-7 w-40 sm:h-8" />
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
              <Skeleton className="h-9 w-28 shrink-0 rounded-md" />
            </div>
            <div className="flex gap-4 overflow-hidden pb-1">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="w-[min(100%,17.5rem)] shrink-0 overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm sm:w-72"
                >
                  <Skeleton className="aspect-[16/10] w-full rounded-none rounded-t-xl" />
                  <div className="space-y-2 p-3">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Photo + video rows */}
      <section className="border-b border-border/40 bg-background py-10 sm:py-12" aria-hidden>
        <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6">
          <div>
            <Skeleton className="h-7 w-44 sm:h-8" />
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="aspect-[4/3] w-full rounded-xl" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-7 w-40 sm:h-8" />
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
              {Array.from({ length: 8 }, (_, i) => (
                <Skeleton key={i} className="aspect-video w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Donation CTA band */}
      <section className="border-b border-border/40 bg-secondary/15 py-10" aria-hidden>
        <div className="mx-auto max-w-3xl space-y-4 px-4 text-center sm:px-6">
          <Skeleton className="mx-auto h-8 w-56 max-w-full" />
          <Skeleton className="mx-auto h-4 w-full max-w-lg" />
          <Skeleton className="mx-auto h-11 w-44 rounded-md" />
        </div>
      </section>

      {/* Quick contact */}
      <section className="bg-background py-10 sm:py-12" aria-hidden>
        <div className="mx-auto max-w-xl space-y-4 px-4 sm:px-6">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </section>
    </div>
  );
}
