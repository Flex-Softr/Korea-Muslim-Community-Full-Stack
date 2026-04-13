import { EditVideoPageForm } from "@/components/dashboard/edit-video-page-form";

export default async function DashboardEditVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditVideoPageForm id={id} />;
}
