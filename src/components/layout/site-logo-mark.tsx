import { cn } from "@/lib/utils";

type SiteLogoMarkProps = {
  className?: string;
  /** Set on the header so the logo loads early; omit in the footer. */
  priority?: boolean;
};

/**
 * Official `/brand/logo.png` in the same frame as the header — use anywhere the brand mark should match.
 */
export function SiteLogoMark({ className, priority }: SiteLogoMarkProps) {
  return (
    <span
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 shadow-md ring-1 ring-black/15 sm:h-[3.25rem] sm:w-[3.25rem]",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- public brand asset */}
      <img
        src="/brand/logo.png"
        alt=""
        width={640}
        height={640}
        className="h-full w-full object-contain"
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
      />
    </span>
  );
}