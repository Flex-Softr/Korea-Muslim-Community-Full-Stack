"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  PageBanner,
  type PageBannerBreadcrumb,
} from "@/components/layout/page-banner";
import {
  useLanguage,
  type TranslationKey,
} from "@/components/providers/language-provider";
import {
  pickLocalizedFields,
  type LocaleContentMap,
} from "@/lib/i18n/content-locale";
import { cleanHtml } from "@/lib/utils";

export type SimpleDetailItem = {
  id: string;
  href: string;
  title: string;
  image: string;
  category?: string;
  description?: string;
  localeContent?: LocaleContentMap | null;
};

export function SimpleDetailLayout({
  sidebarTitle,
  sidebarTitleKey,
  item,
  sidebarItems,
  sidebar,
  parentHref,
  parentLabel,
  parentLabelKey,
}: {
  sidebarTitle: string;
  sidebarTitleKey?: TranslationKey;
  item: SimpleDetailItem;
  sidebarItems?: SimpleDetailItem[];
  /** When provided, replaces the default “latest items” sidebar. */
  sidebar?: ReactNode;
  parentHref?: string;
  parentLabel?: string;
  parentLabelKey?: TranslationKey;
}) {
  const { lang, t } = useLanguage();
  const translate = t as unknown as (key: TranslationKey) => string;

  const resolveItem = (entry: SimpleDetailItem): SimpleDetailItem => {
    const localized = entry.localeContent
      ? pickLocalizedFields(entry.localeContent, lang)
      : null;

    return {
      ...entry,
      title: localized?.title?.trim() || entry.title,
      category: localized?.category?.trim() || entry.category,
      description: localized?.description || entry.description,
    };
  };

  const resolvedItem = resolveItem(item);
  const resolvedSidebarItems = (sidebarItems ?? []).map(resolveItem);
  const resolvedSidebarTitle = sidebarTitleKey
    ? translate(sidebarTitleKey)
    : sidebarTitle;
  const shouldRenderBanner = Boolean(
    parentHref || parentLabel || parentLabelKey,
  );
  const parentCrumb: PageBannerBreadcrumb = parentLabelKey
    ? { labelKey: parentLabelKey, href: parentHref }
    : { label: parentLabel ?? resolvedSidebarTitle, href: parentHref };

  return (
    <>
      {shouldRenderBanner ? (
        <PageBanner
          title={resolvedItem.title}
          breadcrumbs={[
            { labelKey: "nav.home", href: "/" },
            parentCrumb,
            { label: resolvedItem.title },
          ]}
        />
      ) : null}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            {sidebar ?? (
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="border-b border-border px-4 py-3">
                  <h2 className="text-base font-semibold">
                    {resolvedSidebarTitle}
                  </h2>
                </div>
                <div className="flex flex-col gap-4 p-4">
                  {resolvedSidebarItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No other items found.
                    </p>
                  ) : (
                    resolvedSidebarItems.map((sidebarItem) => (
                      <Link
                        key={sidebarItem.id}
                        href={sidebarItem.href}
                        className="flex gap-3 text-left transition-colors hover:text-[#2c7bb6]"
                      >
                        <span className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                          <Image
                            src={sidebarItem.image}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </span>
                        <span className="line-clamp-2 text-sm font-medium">
                          {sidebarItem.title}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </aside>

          <article className="min-w-0 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
            <h1 className="text-3xl font-semibold tracking-tight">
              {resolvedItem.title}
            </h1>
            <div
              className="prose prose-slate mt-4 max-w-none text-lg dark:prose-invert rich-content"
              dangerouslySetInnerHTML={{
                __html: cleanHtml(resolvedItem.description || ""),
              }}
            />
          </article>
        </div>
      </div>
    </>
  );
}
