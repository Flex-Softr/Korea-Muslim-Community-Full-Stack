"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Landmark,
  MessageCircle,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { cn, cleanHtml } from "@/lib/utils";

export type MosquePhotoItem = {
  id: string;
  title: string;
  imageSrc: string;
  category: string;
};

type MosqueTabKey = "our-mosque" | "korea-mosques";

const MOSQUE_TABS: Array<{
  key: MosqueTabKey;
  label: string;
  icon: typeof Landmark;
}> = [
  { key: "our-mosque", label: "আমাদের মসজিদ", icon: Landmark },
  { key: "korea-mosques", label: "কোরিয়ার মসজিদ সমূহ", icon: Building2 },
];

function tabFromParam(value: string | null): MosqueTabKey {
  if (value === "korea-mosques") return "korea-mosques";
  return "our-mosque";
}

export function MosqueTabs({ photos }: { photos: MosquePhotoItem[] }) {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const activeTab = tabFromParam(searchParams?.get("tab") ?? null);
  const activeTabItem = MOSQUE_TABS.find((tab) => tab.key === activeTab) ?? MOSQUE_TABS[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-base font-semibold">{t("nav.mosque")} media</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Photos published with the Mosque category in the gallery.
              </p>
            </div>
            <MosqueMediaCarousel
              photos={photos}
              emptyLabel="No Mosque category photos have been published yet."
            />
          </div>
        </aside>

        <main className="min-w-0">
          <nav aria-label="Mosque sections" className="mb-6 flex flex-wrap gap-2">
            {MOSQUE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              const q = new URLSearchParams(searchParams?.toString() ?? "");
              q.set("tab", tab.key);

              return (
                <Link
                  key={tab.key}
                  href={`/mosque?${q.toString()}`}
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
            <MosquePanel tab={activeTabItem} />
          </section>

          <section className="mt-8 rounded-lg bg-[#0f766e] px-5 py-6 text-white sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">মসজিদ বিষয়ে সাহায্য দরকার?</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
                  মসজিদ, নামাজের স্থান অথবা কমিউনিটি তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন।
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/70 bg-white px-4 py-2 text-sm font-semibold text-[#0f766e] shadow-md shadow-black/10 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:w-auto"
              >
                <MessageCircle className="size-4" aria-hidden />
                যোগাযোগ করুন
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function MosqueMediaCarousel({
  photos,
  emptyLabel,
}: {
  photos: MosquePhotoItem[];
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
              aria-label="Previous mosque media photo"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md bg-black/35 text-white transition-colors hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              aria-label="Next mosque media photo"
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
              aria-label={`Show mosque media photo ${dotIndex + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

const TAB_CATEGORIES: Record<MosqueTabKey, string> = {
  "our-mosque": "Mosque - Our Mosque",
  "korea-mosques": "Mosque - Korea Mosques",
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
        লোড হচ্ছে...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        কোন তথ্য পাওয়া যায়নি। অনুগ্রহ করে অ্যাডমিন ড্যাশবোর্ড থেকে এই ক্যাটাগরিতে কনটেন্ট পাবলিশ করুন।
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

function MosquePanel({
  tab,
}: {
  tab: {
    key: MosqueTabKey;
    label: string;
    icon: typeof Landmark;
  };
}) {
  const Icon = tab.icon;
  const categoryName = TAB_CATEGORIES[tab.key] || "Mosque - Our Mosque";

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-border/65 pb-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[#2c7bb6]/10 text-[#2c7bb6]">
          <Icon className="size-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{tab.label}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            মসজিদ বিষয়ক ডাইনামিক কনটেন্ট।
          </p>
        </div>
      </div>

      <div className="pt-2">
        <DynamicTabContent category={categoryName} />
      </div>
    </div>
  );
}
