import { EditGenericContentPageForm } from "@/components/dashboard/generic-content-page-form";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditGenericContentPageForm type="article" id={id} />;
}
