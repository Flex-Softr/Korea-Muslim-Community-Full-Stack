import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/layout/page-banner";
import { getRequestLang } from "@/lib/i18n/server-language";
import { getServerT, serverT } from "@/lib/i18n/server-translate";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: serverT(lang, "breadcrumbs.team"),
  };
}

export default async function TeamPage() {
  const st = await getServerT();
  return (
    <>
      <PageBanner
        title={st("breadcrumbs.team")}
        subtitle={st("pages.team.subtitle")}
        breadcrumbs={[{ label: st("nav.home"), href: "/" }, { label: st("breadcrumbs.team") }]}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-muted-foreground">{st("pages.team.body")}</p>
        <p className="mt-8 text-sm">
          <Link
            href="/"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {st("common.backToHome")}
          </Link>
        </p>
      </div>
    </>
  );
}
