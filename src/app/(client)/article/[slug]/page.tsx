import { notFound } from "next/navigation";
import { SimpleDetailLayout } from "@/components/cms/simple-detail-layout";
import { listDashboardArticles } from "@/lib/dashboard/store";

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rows = await listDashboardArticles();
  const row = rows.find((item) => item.slug === slug || item.id === slug);
  if (!row) notFound();
  const sidebarItems = rows
    .filter((item) => item.id !== row.id)
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      href: `/article/${item.slug}`,
      title: item.title,
      image: item.coverImage || "/brand/logo.png",
      description: item.description,
      localeContent: item.localeContent,
    }));

  return (
    <SimpleDetailLayout
      sidebarTitle="Latest Articles"
      sidebarTitleKey="breadcrumbs.article"
      parentHref="/article"
      parentLabelKey="breadcrumbs.article"
      item={{
        id: row.id,
        href: `/article/${row.slug}`,
        title: row.title,
        image: row.coverImage || "/brand/logo.png",
        description: row.description,
        localeContent: row.localeContent,
      }}
      sidebarItems={sidebarItems}
    />
  );
}
