import { notFound } from "next/navigation";
import { PageBanner } from "@/components/layout/page-banner";
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
    }));

  return (
    <>
      <PageBanner
        title={row.title}
        breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { label: "Articles", href: "/article" }, { label: row.title }]}
      />
      <SimpleDetailLayout
        sidebarTitle="Latest Articles"
        item={{
          id: row.id,
          href: `/article/${row.slug}`,
          title: row.title,
          image: row.coverImage || "/brand/logo.png",
          description: row.description,
        }}
        sidebarItems={sidebarItems}
      />
    </>
  );
}
