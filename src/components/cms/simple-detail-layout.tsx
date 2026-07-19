"use client";

import Image from "next/image";
import Link from "next/link";
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
  parentHref,
  parentLabel,
  parentLabelKey,
}: {
  sidebarTitle: string;
  sidebarTitleKey?: TranslationKey;
  item: SimpleDetailItem;
  sidebarItems: SimpleDetailItem[];
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
  const resolvedSidebarItems = sidebarItems.map(resolveItem);
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
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-2 py-10 sm:flex-row">
        <aside className="w-full sm:w-1/3">
          <div className="border-1 p-2 shadow-sm shadow-gray-400">
            <h2 className="bg-[#0a1628] p-3 text-lg text-white">
              {resolvedSidebarTitle}
            </h2>
            <div className="flex flex-col gap-4 bg-[#5bc0de] px-4 py-6">
              {resolvedSidebarItems.length === 0 ? (
                <p className="text-base">No other items found.</p>
              ) : (
                resolvedSidebarItems.map((sidebarItem) => (
                  <Link
                    key={sidebarItem.id}
                    href={sidebarItem.href}
                    className="flex gap-3 text-left hover:underline"
                  >
                    <span className="relative size-16 shrink-0 overflow-hidden bg-white/30">
                      <Image
                        src={sidebarItem.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </span>
                    <span className="line-clamp-2 text-lg">
                      {sidebarItem.title}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </aside>

        <article className="w-full border-b-4 border-[#5bc0de] px-3 py-4 shadow-sm shadow-gray-400 sm:w-2/3">
          {/* <div className="relative mb-5 aspect-video w-full overflow-hidden bg-muted">
            <Image
              src={resolvedItem.image}
              alt={resolvedItem.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 66vw"
              priority
            />
          </div> */}
          <h1 className="text-3xl font-semibold">{resolvedItem.title}</h1>
          <div
            className="prose prose-slate mt-4 max-w-none text-lg dark:prose-invert rich-content"
            dangerouslySetInnerHTML={{
              __html: cleanHtml(resolvedItem.description || ""),
            }}
          />
        </article>
      </div>
    </>
  );
}
