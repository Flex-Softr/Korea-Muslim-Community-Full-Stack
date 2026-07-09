"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Download, ExternalLink, FileText, MessageCircle, Smartphone } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { cn, cleanHtml } from "@/lib/utils";

export type EpsPhotoItem = {
  id: string;
  title: string;
  imageSrc: string;
  category: string;
};

type EpsTabKey = "form" | "link" | "app";

const EPS_TABS: Array<{
  key: EpsTabKey;
  labelKey: string;
  icon: typeof FileText;
}> = [
  { key: "form", labelKey: "nav.epsForm", icon: FileText },
  { key: "link", labelKey: "nav.epsLink", icon: ExternalLink },
  { key: "app", labelKey: "nav.epsApp", icon: Smartphone },
];

function tabFromParam(value: string | null): EpsTabKey {
  if (value === "link" || value === "app") return value;
  return "form";
}

export function EpsTabs({ photos }: { photos: EpsPhotoItem[] }) {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const tt = t as unknown as (key: string) => string;
  const activeTab = tabFromParam(searchParams?.get("tab") ?? null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-base font-semibold">{tt("pages.eps.sidebarTitle")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{tt("pages.eps.sidebarSubtitle")}</p>
            </div>
            <EpsMediaCarousel photos={photos} emptyLabel={tt("pages.eps.sidebarEmpty")} />
          </div>
        </aside>

        <main className="min-w-0">
          <nav aria-label="EPS sections" className="mb-6 flex flex-wrap gap-2">
            {EPS_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              const q = new URLSearchParams(searchParams?.toString() ?? "");
              q.set("tab", tab.key);

              return (
                <Link
                  key={tab.key}
                  href={`/eps?${q.toString()}`}
                  scroll={false}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                    isActive
                      ? "border-[#2c7bb6] bg-[#2c7bb6] text-white shadow-sm"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {tt(tab.labelKey)}
                </Link>
              );
            })}
          </nav>

          <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
            {activeTab === "form" ? <EpsFormPanel category={TAB_CATEGORIES.form} /> : null}
            {activeTab === "link" ? <EpsLinkPanel category={TAB_CATEGORIES.link} /> : null}
            {activeTab === "app" ? <EpsAppPanel category={TAB_CATEGORIES.app} /> : null}
          </section>

          <section className="mt-8 rounded-lg bg-[#0f766e] px-5 py-6 text-white sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">{tt("pages.eps.ctaTitle")}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
                  {tt("pages.eps.ctaBody")}
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/70 bg-white px-4 py-2 text-sm font-semibold text-[#0f766e] shadow-md shadow-black/10 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:w-auto"
              >
                <MessageCircle className="size-4" aria-hidden />
                {tt("pages.eps.ctaButton")}
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function EpsMediaCarousel({
  photos,
  emptyLabel,
}: {
  photos: EpsPhotoItem[];
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
              aria-label="Previous EPS media photo"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md bg-black/35 text-white transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              aria-label="Next EPS media photo"
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
                dotIndex === index ? "w-5 bg-[#2c7bb6]" : "w-2 bg-muted-foreground/35 hover:bg-muted-foreground/60",
              )}
              aria-label={`Show EPS media photo ${dotIndex + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

const TAB_CATEGORIES: Record<EpsTabKey, string> = {
  form: "EPS - Form",
  link: "EPS - Link",
  app: "EPS - App",
};

function DynamicTabContent({ category }: { category: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/public/other-page-data?category=${encodeURIComponent(category)}&pageSize=20`);
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
        No content found. Please publish content from the admin dashboard under this category.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {items.map((item) => (
        <article key={item.id} className="prose max-w-none border-b border-border/60 pb-8 last:border-0 last:pb-0">
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">{item.title}</h2>
          {item.image && item.image !== "/brand/logo.png" && (
            <div className="relative aspect-video max-w-2xl overflow-hidden rounded-lg border border-border/80 bg-muted mb-6">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div 
            className="text-muted-foreground leading-relaxed space-y-4 rich-content"
            dangerouslySetInnerHTML={{ __html: cleanHtml(item.description) }} 
          />
        </article>
      ))}
    </div>
  );
}

function EpsFormPanel({ category }: { category: string }) {
  return (
    <div className="space-y-6">
      <DynamicTabContent category={category} />
    </div>
  );
}

function EpsLinkPanel({ category }: { category: string }) {
  return (
    <div className="space-y-6">
      <DynamicTabContent category={category} />
    </div>
  );
}

function EpsAppPanel({ category }: { category: string }) {
  return (
    <div className="space-y-6">
      <DynamicTabContent category={category} />
    </div>
  );
}

function PanelHeading({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof FileText;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[#2c7bb6]/10 text-[#2c7bb6]">
        <Icon className="size-5" aria-hidden />
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function ActionRow({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof FileText;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-4 shrink-0 text-[#0f766e]" aria-hidden />
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </div>
      </div>
    </div>
  );
}
