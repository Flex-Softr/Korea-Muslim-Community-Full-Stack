import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function HomeDonationCta() {
  return (
    <section
      aria-labelledby="home-donation-cta-heading"
      className="py-12 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className={cn(
            "overflow-hidden rounded-3xl shadow-lg ring-1 ring-black/[0.06] dark:ring-white/10",
            "bg-gradient-to-r from-[#4a9fd4] via-[#2c7bb6] to-[#1a5580]",
          )}
        >
          <div className="grid md:grid-cols-[1fr_auto_1fr] md:items-stretch">
            {/* Left: headline */}
            <div className="flex flex-col items-center justify-center px-6 py-10 text-center md:items-start md:px-10 md:text-left">
              <h2
                id="home-donation-cta-heading"
                className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[2rem] md:leading-tight lg:text-4xl"
              >
                Donate and Support
              </h2>
              <p
                className="mt-3 max-w-sm text-sm font-medium text-white/85 sm:text-base"
                lang="en"
              >
                Support Korea Muslim Community
              </p>
            </div>

            {/* Vertical divider (desktop) */}
            <div
              className="relative hidden h-full min-h-[10rem] w-px shrink-0 flex-col items-center justify-center py-6 md:flex"
              aria-hidden
            >
              <span className="size-2.5 shrink-0 rounded-full border-2 border-white" />
              <span className="my-2 w-px flex-1 bg-white/85" />
              <span className="size-2.5 shrink-0 rounded-full border-2 border-white" />
            </div>

            {/* Mobile divider */}
            <div
              className="flex items-center justify-center gap-3 px-6 md:hidden"
              aria-hidden
            >
              <span className="h-px flex-1 max-w-[5rem] bg-white/50" />
              <span className="size-2 shrink-0 rounded-full border-2 border-white" />
              <span className="h-px flex-1 max-w-[5rem] bg-white/50" />
            </div>

            {/* Right: copy + CTA */}
            <div className="flex flex-col justify-center px-6 pb-10 pt-2 md:px-10 md:py-10 md:pt-10">
              <p className="text-pretty text-left text-sm leading-relaxed text-white/95 sm:text-base">
                Your gift funds programmes, relief, and welcoming spaces for
                Muslims across Korea — including how to give by bank transfer.
              </p>
              <Link
                href="/donation"
                className={cn(
                  "mt-6 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors",
                  "bg-white/95 text-[#1a5580] hover:bg-white",
                  "dark:bg-sky-100 dark:text-sky-950 dark:hover:bg-white",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2c7bb6]",
                )}
              >
                <span>Donate</span>
                <ArrowUpRight className="size-4 shrink-0 opacity-90" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
