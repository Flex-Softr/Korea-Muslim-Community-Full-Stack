import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogSlugRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/notice/${slug}`);
}