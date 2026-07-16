import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDashboardOtherPageDataById } from "@/lib/dashboard/store";
import { getRequestLang } from "@/lib/i18n/server-language";
import { pickLocalizedFields } from "@/lib/i18n/content-locale";
import { EpsDetailView } from "@/components/eps/eps-detail-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const lang = await getRequestLang();
  const row = await getDashboardOtherPageDataById(id);
  if (!row) return { title: "EPS" };
  const fields = pickLocalizedFields(row.localeContent, lang);
  return {
    title: fields.title || row.title,
    description: (fields.description || row.description || "")
      .slice(0, 200)
      .replace(/<[^>]*>/g, ""),
  };
}

export default async function EpsDetailPage({ params }: PageProps) {
  const { id } = await params;
  const lang = await getRequestLang();
  const row = await getDashboardOtherPageDataById(id);
  if (!row) notFound();

  return (
    <EpsDetailView
      id={row.id}
      localeContent={row.localeContent}
      coverImage={row.coverImage ?? null}
      dateIso={row.dateIso}
      initialLang={lang}
    />
  );
}