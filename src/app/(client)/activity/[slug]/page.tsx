import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ActivityArticleDetail } from "@/components/cms/activity-article-detail";
import { CMS_LIST_QUICK_PREVIEW_CAP } from "@/lib/content/constants";
import {
  getActivityItem,
  listCachedActivityItems,
} from "@/lib/content/repository";
import { toCmsTextDetailSource } from "@/lib/cms/cms-detail-locale-source";
import { getRequestLang } from "@/lib/i18n/server-language";
import { serverT } from "@/lib/i18n/server-translate";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getActivityItem(slug);
  if (!item) {
    const lang = await getRequestLang();
    return { title: serverT(lang, "common.activity") };
  }
  return {
    title: item.title,
    description: item.excerpt,
  };
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const requestLang = await getRequestLang();
  const [item, listResult] = await Promise.all([
    getActivityItem(slug, requestLang),
    listCachedActivityItems(
      { page: 1, pageSize: CMS_LIST_QUICK_PREVIEW_CAP },
      requestLang,
      { maxRowsFromDb: CMS_LIST_QUICK_PREVIEW_CAP, withFacets: false },
    ),
  ]);
  if (!item) {
    notFound();
  }
  const sidebarItems = listResult.items.filter((entry) => entry.slug !== slug).slice(0, 5);
  const source = toCmsTextDetailSource({
    id: item.id,
    slug: item.slug,
    imageSrc: item.imageSrc,
    dateIso: item.dateIso,
    date: item.date,
    title: item.title,
    category: item.category,
    body: item.content,
    localeContent: item.localeContent ?? null,
    resolvedForLang: requestLang,
  });

  const sidebarCards = sidebarItems.map((s) =>
    toCmsTextDetailSource({
      id: s.id,
      slug: s.slug,
      imageSrc: s.imageSrc,
      dateIso: s.dateIso,
      date: s.date,
      title: s.title,
      category: s.category,
      body: s.content,
      localeContent: s.localeContent ?? null,
    }),
  );


  return (
    <ActivityArticleDetail key={slug} source={source} sidebarCards={sidebarCards} />
  );
}
