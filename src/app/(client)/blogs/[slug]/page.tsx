import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogsSlugRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/notice/${slug}`);
}
