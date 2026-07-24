"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, FileText, MessageCircle } from "lucide-react";
import { ModuleTabsSidebar } from "@/components/layout/module-tabs-sidebar";
import { useLanguage, useI18n } from "@/components/providers/language-provider";
import { PARENT_MODULES, tabHref as buildTabHref } from "@/lib/module-sections/config";

const EPS_MODULE = PARENT_MODULES.eps;
type EpsTabKey = (typeof EPS_MODULE.tabs)[number]["key"];

function tabFromParam(value: string | null): EpsTabKey {
  const match = EPS_MODULE.tabs.find((tab) => tab.key === value);
  return match?.key ?? EPS_MODULE.tabs[0].key;
}

export function EpsTabs() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const tt = t as unknown as (key: string) => string;
  const activeTab = tabFromParam(searchParams?.get("tab") ?? null);
  const activeCategory =
    EPS_MODULE.tabs.find((tab) => tab.key === activeTab)?.category ??
    EPS_MODULE.tabs[0].category;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ModuleTabsSidebar
            titleKey={EPS_MODULE.sidebarTitleKey}
            subtitleKey={EPS_MODULE.sidebarSubtitleKey}
            activeKey={activeTab}
            selectId="eps-tab-select"
            ariaLabel="EPS sections"
            tabs={EPS_MODULE.tabs.map((tab) => ({
              key: tab.key,
              href: buildTabHref(EPS_MODULE.basePath, tab.key),
              label: tab.label,
              labelKey: tab.labelKey,
              icon: tab.icon,
            }))}
          />
        </aside>

        <main className="min-w-0">
          <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
            <DynamicTabContent category={activeCategory} />
          </section>

          <section className="mt-8 rounded-lg bg-[#0f766e] px-5 py-6 text-white sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {tt("pages.eps.ctaTitle")}
                </h2>
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

function DynamicTabContent({ category }: { category: string }) {
  const { lang } = useI18n();
  const [items, setItems] = useState<
    Array<{
      id: string;
      title: string;
      image?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/public/other-page-data?category=${encodeURIComponent(category)}&pageSize=20&lang=${encodeURIComponent(lang)}`,
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
  }, [category, lang]);

  if (loading) {
    return (
      <div className="animate-pulse py-12 text-center text-muted-foreground">
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/eps/detail/${item.id}`}
          className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2c7bb6]/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c7bb6]/50"
        >
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            {item.image && item.image !== "/brand/logo.png" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#2c7bb6]/10 text-[#2c7bb6]">
                <FileText className="size-8" aria-hidden />
              </div>
            )}
            <div className="absolute inset-0 bg-[#2c7bb6]/0 transition-colors duration-200 group-hover:bg-[#2c7bb6]/10" />
            <ArrowUpRight
              className="absolute right-2 top-2 size-4 rounded-full bg-white/80 p-0.5 text-[#2c7bb6] opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100"
              aria-hidden
            />
          </div>

          <div className="flex flex-1 items-center px-3 py-2.5">
            <span className="line-clamp-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-[#2c7bb6]">
              {item.title}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
