import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageBanner } from "@/components/layout/page-banner";
import { getRequestLang } from "@/lib/i18n/server-language";
import { getServerT, serverT } from "@/lib/i18n/server-translate";
import { SupporterSubmissionForm } from "./components/supporter-submission-form";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: serverT(lang, "supporterSubmission.pageTitle"),
    description: serverT(lang, "supporterSubmission.termsAndConditions"),
  };
}

export default async function SupporterSubmissionPage() {
  const st = await getServerT();

  return (
    <>
      <PageBanner
        titleKey="supporterSubmission.pageTitle"
        subtitleKey="supporterSubmission.pageTitle"
        breadcrumbs={[
          { labelKey: "nav.home", href: "/" },
          { labelKey: "supporterSubmission.pageTitle" },
        ]}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Card className="shadow-md ring-1 ring-border/60">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl font-bold">
              {st("supporterSubmission.pageTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SupporterSubmissionForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
