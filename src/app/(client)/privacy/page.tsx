import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/layout/page-banner";
import { getRequestLang } from "@/lib/i18n/server-language";
import { getServerT, serverT } from "@/lib/i18n/server-translate";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: serverT(lang, "breadcrumbs.privacyPolicy"),
    description: serverT(lang, "pages.privacy.subtitle"),
  };
}

export default async function PrivacyPage() {
  const st = await getServerT();
  return (
    <>
      <PageBanner
        title={st("breadcrumbs.privacyPolicy")}
        subtitle={st("pages.privacy.subtitle")}
        breadcrumbs={[
          { label: st("nav.home"), href: "/" },
          { label: st("breadcrumbs.privacyPolicy") },
        ]}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-muted-foreground">
          This is placeholder content for a generic starter. Replace it with a
          policy that matches your jurisdiction, data practices, and hosting
          providers before production.
        </p>
        <ul className="mt-8 list-inside list-disc space-y-3 text-sm text-foreground/90">
          <li>
            Describe what personal data you collect (e.g. account email, usage
            logs).
          </li>
          <li>Explain how data is stored, retained, and deleted.</li>
          <li>List subprocessors and international transfers if applicable.</li>
          <li>Provide contact details for privacy requests.</li>
        </ul>
        <p className="mt-10 text-sm">
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
