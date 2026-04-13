import { EditBlogPageForm } from "@/components/dashboard/edit-blog-page-form";

export default async function DashboardEditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditBlogPageForm id={id} />;
}
