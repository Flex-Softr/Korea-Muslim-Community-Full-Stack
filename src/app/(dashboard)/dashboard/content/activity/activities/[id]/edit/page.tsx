import { EditActivityPageForm } from "@/components/dashboard/edit-activity-page-form";

export default async function DashboardEditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditActivityPageForm id={id} />;
}
