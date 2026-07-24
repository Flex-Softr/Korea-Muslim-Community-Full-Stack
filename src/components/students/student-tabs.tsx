"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import { ModuleTabsSidebar } from "@/components/layout/module-tabs-sidebar";
import { useLanguage } from "@/components/providers/language-provider";
import {
  PARENT_MODULES,
  tabHref as buildTabHref,
} from "@/lib/module-sections/config";
import { cleanHtml } from "@/lib/utils";

const STUDENTS_MODULE = PARENT_MODULES.students;
type StudentTabKey = (typeof STUDENTS_MODULE.tabs)[number]["key"];

function tabFromParam(value: string | null): StudentTabKey {
  const match = STUDENTS_MODULE.tabs.find((tab) => tab.key === value);
  return match?.key ?? STUDENTS_MODULE.tabs[0].key;
}

export function StudentTabs() {
  const searchParams = useSearchParams();
  const activeTab = tabFromParam(searchParams?.get("tab") ?? null);
  const activeTabItem =
    STUDENTS_MODULE.tabs.find((tab) => tab.key === activeTab) ??
    STUDENTS_MODULE.tabs[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ModuleTabsSidebar
            titleKey={STUDENTS_MODULE.sidebarTitleKey}
            subtitleKey={STUDENTS_MODULE.sidebarSubtitleKey}
            activeKey={activeTab}
            selectId="students-tab-select"
            ariaLabel="Student sections"
            tabs={STUDENTS_MODULE.tabs.map((tab) => ({
              key: tab.key,
              href: buildTabHref(STUDENTS_MODULE.basePath, tab.key),
              label: tab.label,
              labelKey: tab.labelKey,
              icon: tab.icon,
            }))}
          />
        </aside>

        <main className="min-w-0">
          <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
            <StudentPanel tab={activeTabItem} />
          </section>
          <section className="mt-8 rounded-lg bg-[#0f766e] px-5 py-6 text-white sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Need student support?</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
                  Contact the community team for student programs, resources,
                  and guidance.
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

interface OtherPageDataItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  rawCategory: string;
  slug: string;
}

function DynamicTabContent({ category }: { category: string }) {
  const [items, setItems] = useState<OtherPageDataItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { lang } = useLanguage();

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
        const categorySlug = (item.rawCategory || item.category)
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
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              {hasImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#2c7bb6]/10 to-[#2c7bb6]/5">
                  <GraduationCap
                    className="size-12 text-[#2c7bb6]/30"
                    aria-hidden
                  />
                </div>
              )}
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
                    __html:
                      cleanHtml(item.description)
                        .replace(/<[^>]*>/g, " ")
                        .trim()
                        .slice(0, 100) + "...",
                  }}
                />
              )}
              <div className="mt-auto pt-3 flex items-center gap-1 text-xs font-medium text-[#2c7bb6]">
                <span>Read more</span>
                <ChevronRight
                  className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function StudentPanel({
  tab,
}: {
  tab: (typeof STUDENTS_MODULE.tabs)[number];
}) {
  const Icon = tab.icon;
  const categoryName = tab.category;

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-border/65 pb-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[#2c7bb6]/10 text-[#2c7bb6]">
          <Icon className="size-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {tab.label ?? tab.key}
          </h2>
        </div>
      </div>
      <div className="pt-2">
        <DynamicTabContent category={categoryName} />
      </div>
    </div>
  );
}
