import { notFound } from "next/navigation";
import { PageBanner } from "@/components/layout/page-banner";
import { SimpleDetailLayout } from "@/components/cms/simple-detail-layout";
import { listDashboardOtherPageData } from "@/lib/dashboard/store";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default async function OtherPageDataDetailPage({
  params,
}: {
  params: Promise<{ category: string; title: string }>;
}) {
  const { category, title } = await params;
  const rows = await listDashboardOtherPageData();
  const row = rows.find(
    (item) =>
      slugify(item.category) === category &&
      (item.slug === title || slugify(item.title) === title || item.id === title),
  );
  if (!row) notFound();

  const sidebarItems = rows
    .filter((item) => item.id !== row.id && item.category === row.category)
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      href: `/${slugify(item.category)}/${item.slug}`,
      title: item.title,
      image: item.coverImage || "/brand/logo.png",
      description: item.description,
    }));

  return (
    <>
      <PageBanner
        title={row.title}
        breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { label: row.category }, { label: row.title }]}
      />
      <SimpleDetailLayout
        sidebarTitle={`Latest ${row.category}`}
        item={{
          id: row.id,
          href: `/${slugify(row.category)}/${row.slug}`,
          title: row.title,
          image: row.coverImage || "/brand/logo.png",
          description: row.description,
        }}
        sidebarItems={sidebarItems}
      />
    </>
  );
}
