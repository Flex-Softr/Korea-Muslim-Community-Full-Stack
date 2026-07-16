"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  GraduationCap,
  MessageCircle,
  Users,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { cn, cleanHtml } from "@/lib/utils";

export type EducationPhotoItem = {
  id: string;
  title: string;
  imageSrc: string;
  category: string;
};

type EducationTabKey = "overview" | "classes" | "events" | "resources";

const EDUCATION_TABS: Array<{
  key: EducationTabKey;
  label: string;
  icon: typeof GraduationCap;
}> = [
  { key: "overview", label: "Overview", icon: GraduationCap },
  { key: "classes", label: "Classes", icon: BookOpen },
  { key: "events", label: "Events", icon: CalendarDays },
  { key: "resources", label: "Resources", icon: FileText },
];

function tabFromParam(value: string | null): EducationTabKey {
  if (value === "classes" || value === "events" || value === "resources") {
    return value;
  }
  return "overview";
}

export function EducationTabs({ photos }: { photos: EducationPhotoItem[] }) {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const activeTab = tabFromParam(searchParams?.get("tab") ?? null);
  const activeTabItem =
    EDUCATION_TABS.find((tab) => tab.key === activeTab) ?? EDUCATION_TABS[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-base font-semibold">
                {t("nav.education")} media
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Photos published with the Education category in the gallery.
              </p>
            </div>
            <EducationMediaCarousel
              photos={photos}
              emptyLabel="No Education category photos have been published yet."
            />
          </div>
        </aside>

        <main className="min-w-0">
          <nav
            aria-label="Education sections"
            className="mb-6 flex flex-wrap gap-2"
          >
            {EDUCATION_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              const q = new URLSearchParams(searchParams?.toString() ?? "");
              q.set("tab", tab.key);

              return (
                <Link
                  key={tab.key}
                  href={`/education?${q.toString()}`}
                  scroll={false}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                    isActive
                      ? "border-[#2c7bb6] bg-[#2c7bb6] text-white shadow-sm"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
            <EducationPanel tab={activeTabItem} />
          </section>

          <section className="mt-8 rounded-lg bg-[#0f766e] px-5 py-6 text-white sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Need education support?
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
                  Contact the community team for classes, programs, and learning
                  resources.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/70 bg-white px-4 py-2 text-sm font-semibold text-[#0f766e] shadow-md shadow-black/10 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:w-auto"
              >
                <MessageCircle className="size-4" aria-hidden />
                Contact us
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function EducationMediaCarousel({
  photos,
  emptyLabel,
}: {
  photos: EducationPhotoItem[];
  emptyLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const hasMultiple = photos.length > 1;
  const active = photos[index] ?? null;

  useEffect(() => {
    setIndex((current) => {
      if (photos.length === 0) return 0;
      return current >= photos.length ? 0 : current;
    });
  }, [photos.length]);

  useEffect(() => {
    if (!hasMultiple) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % photos.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [hasMultiple, photos.length]);

  const goPrev = () => {
    if (!hasMultiple) return;
    setIndex((current) => (current - 1 + photos.length) % photos.length);
  };

  const goNext = () => {
    if (!hasMultiple) return;
    setIndex((current) => (current + 1) % photos.length);
  };

  if (!active) {
    return (
      <div className="p-3">
        <p className="rounded-md bg-muted px-3 py-4 text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="relative overflow-hidden rounded-md bg-muted">
        <div className="relative aspect-[4/3]">
          <Image
            key={active.id}
            src={active.imageSrc}
            alt={active.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 280px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3 text-white">
            <p className="line-clamp-2 text-sm font-semibold">{active.title}</p>
            <p className="mt-1 text-xs text-white/80">{active.category}</p>
          </div>
        </div>

        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md bg-black/35 text-white transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              aria-label="Previous education media photo"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md bg-black/35 text-white transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              aria-label="Next education media photo"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {hasMultiple ? (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {photos.map((photo, dotIndex) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setIndex(dotIndex)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                dotIndex === index
                  ? "w-5 bg-[#2c7bb6]"
                  : "w-2 bg-muted-foreground/35 hover:bg-muted-foreground/60",
              )}
              aria-label={`Show education media photo ${dotIndex + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

const TAB_CATEGORIES: Record<EducationTabKey, string> = {
  overview: "Education - Overview",
  classes: "Education - Classes",
  events: "Education - Events",
  resources: "Education - Resources",
};

function DynamicTabContent({ category }: { category: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/public/other-page-data?category=${encodeURIComponent(category)}&pageSize=20`,
        );
        const data = await res.json();
        if (!res.ok || !active) return;
        setItems(data.items ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [category]);

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground animate-pulse">
        Loading content...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No content found. Please publish content from the admin dashboard under
        this category.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const categorySlug = item.category
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
        const titleSlug =
          item.slug ||
          item.title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
        const href = `/${categorySlug}/${titleSlug}`;
        const hasImage = item.image && item.image !== "/brand/logo.png";

        return (
          <Link
            key={item.id}
            href={href}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#2c7bb6]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c7bb6]/60"
          >
            {/* Cover image */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
              {hasImage ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2c7bb6]/10 to-[#2c7bb6]/5">
                  <GraduationCap className="size-12 text-[#2c7bb6]/30" aria-hidden />
                </div>
              )}
              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>

            {/* Card body */}
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-[#2c7bb6]">
                {item.title}
              </h3>
              {item.description && (
                <p
                  className="line-clamp-3 text-sm leading-relaxed text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: cleanHtml(item.description).replace(/<[^>]*>/g, " ").trim(),
                  }}
                />
              )}
              <div className="mt-auto pt-3 flex items-center gap-1 text-xs font-medium text-[#2c7bb6]">
                <span>Read more</span>
                <ChevronRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function EducationPanel({
  tab,
}: {
  tab: {
    key: EducationTabKey;
    label: string;
    icon: typeof GraduationCap;
  };
}) {
  const Icon = tab.icon;
  const categoryName = TAB_CATEGORIES[tab.key] || "Education - Overview";

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-border/65 pb-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[#2c7bb6]/10 text-[#2c7bb6]">
          <Icon className="size-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{tab.label}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Dynamic content for the education program.
          </p>
        </div>
      </div>

      <div className="pt-2">
        <DynamicTabContent category={categoryName} />
      </div>
    </div>
  );
}
