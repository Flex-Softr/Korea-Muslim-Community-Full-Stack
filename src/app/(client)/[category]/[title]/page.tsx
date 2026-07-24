import { notFound } from "next/navigation";
import { SimpleDetailLayout } from "@/components/cms/simple-detail-layout";
import { ParentModuleSidebar } from "@/components/layout/parent-module-sidebar";
import { listDashboardOtherPageData } from "@/lib/dashboard/store";
import {
  resolveParentModule,
  tabHref,
} from "@/lib/module-sections/config";

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

  const parent = resolveParentModule(row.category);
  const sidebarItems = rows
    .filter((item) => item.id !== row.id && item.category === row.category)
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      href: `/${slugify(item.category)}/${item.slug}`,
      title: item.title,
      image: item.coverImage || "/brand/logo.png",
      description: item.description,
      localeContent: item.localeContent,
    }));

  return (
    <SimpleDetailLayout
      sidebarTitle={
        parent
          ? `Latest ${parent.module.id}`
          : `Latest ${row.category}`
      }
      parentLabel={parent ? undefined : row.category}
      parentLabelKey={parent ? parent.module.parentLabelKey : undefined}
      parentHref={
        parent
          ? tabHref(parent.module.basePath, parent.activeTabKey)
          : `/${slugify(row.category)}`
      }
      item={{
        id: row.id,
        href: `/${slugify(row.category)}/${row.slug}`,
        title: row.title,
        image: row.coverImage || "/brand/logo.png",
        description: row.description,
        localeContent: row.localeContent,
        category: row.category,
      }}
      sidebarItems={parent ? undefined : sidebarItems}
      sidebar={
        parent ? (
          <ParentModuleSidebar
            category={row.category}
            selectId={`${parent.module.id}-detail-tab-select`}
          />
        ) : undefined
      }
    />
  );
}
