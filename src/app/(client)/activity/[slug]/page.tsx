import type { Metadata } from "next";
import { notFound } from "next/navigation";

/** Cookie-driven UI language must not be statically cached without `lang`. */
export const dynamic = "force-dynamic";

import { ActivityArticleDetail } from "@/components/cms/activity-article-detail";
import { CMS_LIST_QUICK_PREVIEW_CAP } from "@/lib/content/constants";
import {
  getActivityItem,
  listActivityItems,
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
    listActivityItems(
      { page: 1, pageSize: CMS_LIST_QUICK_PREVIEW_CAP },
      requestLang,
      { maxRowsFromDb: CMS_LIST_QUICK_PREVIEW_CAP },
    ),
  ]);
  if (!item) {
    notFound();
  }
  const sidebarItems = listResult.items.filter((entry) => entry.slug !== slug).slice(0, 5);
  const activity = listResult.items.filter((entry) => entry.slug == slug);
  const source = toCmsTextDetailSource({
    id: activity[0].id,
    slug: activity[0].slug,
    imageSrc: activity[0].imageSrc,
    dateIso: activity[0].dateIso,
    date: activity[0].date,
    title: activity[0].title,
    category: activity[0].category,
    body: activity[0].content,
    localeContent: activity[0].localeContent ?? null,
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
