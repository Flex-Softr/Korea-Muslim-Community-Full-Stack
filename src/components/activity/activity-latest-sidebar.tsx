import { CMS_LIST_QUICK_PREVIEW_CAP } from "@/lib/content/constants";
import {
  listActivityItems,
} from "@/lib/content/repository";
import { toCmsTextDetailSource } from "@/lib/cms/cms-detail-locale-source";
import { ActivityLatestSidebarClient } from "@/components/activity/activity-latest-sidebar-client";

export async function ActivityLatestSidebar({
  excludeSlug,
  limit = 5,
}: {
  excludeSlug: string;
  limit?: number;
}) {
  const { items: all } = await listActivityItems(
    { page: 1, pageSize: CMS_LIST_QUICK_PREVIEW_CAP },
    undefined,
    { maxRowsFromDb: CMS_LIST_QUICK_PREVIEW_CAP },
  );
  const items = all.filter((entry) => entry.slug !== excludeSlug).slice(0, limit);
  const cards = items.map((s) =>
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
  return <ActivityLatestSidebarClient cards={cards} />;
}
