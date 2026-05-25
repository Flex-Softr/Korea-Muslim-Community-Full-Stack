"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { pickCarouselFields } from "@/lib/i18n/content-locale";
import type { CarouselLocaleMap } from "@/lib/i18n/content-locale";
import { cn } from "@/lib/utils";

export type HeroCarouselSource = {
  id: string;
  imageUrl: string;
  ctaHref?: string;
  sortOrder: number;
  localeContent: CarouselLocaleMap;
};

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel?: string;
  ctaHref?: string;
  sortOrder: number;
};

export function HeroCarousel({ carouselSources }: { carouselSources: HeroCarouselSource[] }) {
  const { lang } = useLanguage();

  const slides = useMemo((): HeroSlide[] => {
    return carouselSources.map((slide) => {
      const loc = pickCarouselFields(slide.localeContent, lang);
      return {
        id: slide.id,
        title: loc.title,
        subtitle: loc.subtitle,
        imageUrl: slide.imageUrl,
        ctaLabel: loc.ctaLabel?.trim() || undefined,
        ctaHref: slide.ctaHref,
        sortOrder: slide.sortOrder,
      };
    });
  }, [carouselSources, lang]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex((i) => {
      if (slides.length === 0) return 0;
      return i >= slides.length ? 0 : i;
    });
  }, [slides.length]);

  const hasSlides = slides.length > 0;
  const current = hasSlides ? slides[index] : null;

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(t);
  }, [slides.length]);

  const goPrev = () => {
    if (slides.length <= 1) return;
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    if (slides.length <= 1) return;
    setIndex((prev) => (prev + 1) % slides.length);
  };

  if (!current) return null;

  const imageSrc = current.imageUrl;

  return (
    <section
      aria-label="Featured banner"
      className="relative w-full border-b border-black/[0.06] bg-[#f0f0f0]"
    >
      <div className="relative mx-auto h-[clamp(15rem,56vw,24rem)] w-full max-w-[1920px] sm:h-[clamp(13rem,32vw,22rem)] md:h-[clamp(13rem,24vw,24rem)]">
        <Image
          src={imageSrc}
          alt={current?.title || "Korea Muslim Community — featured banner"}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/55 to-black-50 md:bg-gradient-to-r md:from-black/55 md:via-black/25 md:to-transparent" />

        {current ? (
          <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-6 md:p-8">
            <div className="mx-auto max-w-7xl text-white">
              <h2 className="text-lg font-bold sm:text-2xl text-white dark:text-white">{current.title}</h2>
              <p className="mt-1 max-w-2xl text-xs text-white dark:text-white sm:text-sm">{current.subtitle}</p>
              {current.ctaLabel && current.ctaHref ? (
                <Link
                  href={current.ctaHref}
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "default" }),
                    "mt-3",
                  )}
                >
                  {current.ctaLabel}
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="absolute inset-0 z-20 flex items-center justify-between px-1 sm:px-3 md:px-5">
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-black/25 text-white shadow-sm transition-all duration-200 hover:bg-black/40 sm:h-9 sm:w-9 md:h-10 md:w-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-4 sm:size-5" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-black/25 text-white shadow-sm transition-all duration-200 hover:bg-black/40 sm:h-9 sm:w-9 md:h-10 md:w-10"
            aria-label="Next slide"
          >
            <ChevronRight className="size-4 sm:size-5" strokeWidth={2.5} />
          </button>
        </div>

        {hasSlides && slides.length > 1 ? (
          <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setIndex(idx)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  idx === index ? "w-5 bg-white" : "w-2.5 bg-white/60 hover:bg-white/80",
                )}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
