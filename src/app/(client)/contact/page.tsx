import type { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageBanner } from "@/components/layout/page-banner";
import { getRequestLang } from "@/lib/i18n/server-language";
import { getServerT, serverT } from "@/lib/i18n/server-translate";
import { ContactForm } from "./components/contact-form";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: serverT(lang, "breadcrumbs.contact"),
    description: serverT(lang, "pages.contact.subtitle"),
  };
}

export default async function ContactPage() {
  const st = await getServerT();
  return (
    <>
      <PageBanner
        titleKey="breadcrumbs.contact"
        subtitleKey="pages.contact.subtitle"
        breadcrumbs={[{ labelKey: "nav.home", href: "/" }, { labelKey: "breadcrumbs.contact" }]}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Card className="shadow-md ring-1 ring-border/60">
          <CardHeader>
            <CardTitle>{st("pages.contact.formCardTitle")}</CardTitle>
            <CardDescription>
              {st("pages.contact.formCardDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
