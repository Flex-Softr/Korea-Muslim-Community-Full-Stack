import { DownloadPageForm } from "@/components/dashboard/download-page-form";

export default async function EditDownloadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DownloadPageForm id={id} />;
}
