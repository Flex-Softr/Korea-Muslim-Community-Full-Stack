import { EditGenericContentPageForm } from "@/components/dashboard/generic-content-page-form";

export default async function EditOtherPageDataPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditGenericContentPageForm type="other-page" id={id} />;
}
