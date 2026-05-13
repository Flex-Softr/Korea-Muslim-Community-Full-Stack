import { CMS_LIST_QUICK_PREVIEW_CAP } from "@/lib/content/constants";
import {
  listBlogPosts,
} from "@/lib/content/repository";
import { toCmsTextDetailSource } from "@/lib/cms/cms-detail-locale-source";
import { BlogLatestSidebarClient } from "@/components/blog/blog-latest-sidebar-client";

export async function BlogLatestSidebar({
  excludeSlug,
  limit = 5,
}: {
  excludeSlug: string;
  limit?: number;
}) {
  const { items: all } = await listBlogPosts(
    { page: 1, pageSize: CMS_LIST_QUICK_PREVIEW_CAP },
    undefined,
    { maxRowsFromDb: CMS_LIST_QUICK_PREVIEW_CAP },
  );
  const items = all.filter((p) => p.slug !== excludeSlug).slice(0, limit);
  const cards = items.map((p) =>
    toCmsTextDetailSource({
      id: p.id,
      slug: p.slug,
      imageSrc: p.coverImage,
      dateIso: p.dateIso,
      date: p.date,
      title: p.title,
      category: p.category,
      body: p.content,
      localeContent: p.localeContent ?? null,
    }),
  );
  return <BlogLatestSidebarClient cards={cards} />;
}
