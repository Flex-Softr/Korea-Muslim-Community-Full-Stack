import { EditGenericContentPageForm } from "@/components/dashboard/generic-content-page-form";

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditGenericContentPageForm type="news" id={id} />;
}
