import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Static hero banner (single slide). Carousel arrows are visual only for now;
 * wire slide state / autoplay when you move to dynamic content.
 */
export function HeroCarousel() {
  return (
    <section
      aria-label="Featured banner"
      className="relative w-full border-b border-black/[0.06] bg-[#f0f0f0]"
    >
      <div className="relative mx-auto h-[clamp(11rem,32vw,20rem)] w-full max-w-[1920px] sm:h-[clamp(12rem,28vw,22rem)] md:h-[clamp(13rem,24vw,24rem)]">
        <Image
          src="/hero/carousel-slide-1.png"
          alt="Korea Muslim Community — featured banner"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />

        {/* Static carousel chrome (non-interactive until dynamic slides exist) */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-between px-1 sm:px-3 md:px-5"
          aria-hidden
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-black/25 text-white shadow-sm sm:h-9 sm:w-9 md:h-10 md:w-10">
            <ChevronLeft className="size-4 sm:size-5" strokeWidth={2.5} />
          </span>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-black/25 text-white shadow-sm sm:h-9 sm:w-9 md:h-10 md:w-10">
            <ChevronRight className="size-4 sm:size-5" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </section>
  );
}
