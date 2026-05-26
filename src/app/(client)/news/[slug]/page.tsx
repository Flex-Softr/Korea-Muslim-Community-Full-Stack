import { notFound } from "next/navigation";
import { SimpleDetailLayout } from "@/components/cms/simple-detail-layout";
import { listDashboardNewsItems } from "@/lib/dashboard/store";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rows = await listDashboardNewsItems();
  const row = rows.find((item) => item.slug === slug || item.id === slug);
  if (!row) notFound();
  const sidebarItems = rows
    .filter((item) => item.id !== row.id)
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      href: `/news/${item.slug}`,
      title: item.title,
      image: item.coverImage || "/brand/logo.png",
      description: item.description,
      localeContent: item.localeContent,
    }));

  return (
    <SimpleDetailLayout
      sidebarTitle="Latest News"
      sidebarTitleKey="breadcrumbs.news"
      parentHref="/news"
      parentLabelKey="breadcrumbs.news"
      item={{
        id: row.id,
        href: `/news/${row.slug}`,
        title: row.title,
        image: row.coverImage || "/brand/logo.png",
        description: row.description,
        localeContent: row.localeContent,
      }}
      sidebarItems={sidebarItems}
    />
  );
}
