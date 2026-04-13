import { EditPhotoPageForm } from "@/components/dashboard/edit-photo-page-form";

export default async function DashboardEditPhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditPhotoPageForm id={id} />;
}
