import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageBanner } from "@/components/layout/page-banner";
import { getRequestLang } from "@/lib/i18n/server-language";
import { getServerT, serverT } from "@/lib/i18n/server-translate";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: serverT(lang, "breadcrumbs.aboutUs"),
    description: serverT(lang, "pages.about.metaDescription"),
  };
}

export default async function AboutPage() {
  const st = await getServerT();
  const a = (key: string) => st(`pages.about.${key}`);

  return (
    <>
      <PageBanner
        title={st("breadcrumbs.aboutUs")}
        subtitle={st("pages.about.subtitle")}
        breadcrumbs={[
          { label: st("nav.home"), href: "/" },
          { label: st("breadcrumbs.aboutUs") },
        ]}
      />

      <div className="border-b border-border/60 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <section
            id="who-we-are"
            aria-labelledby="who-we-are-heading"
            className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-14"
          >
            <div className="lg:col-span-7">
              <h2
                id="who-we-are-heading"
                className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                {a("whoHeading")}
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                <p>
                  <strong className="font-semibold text-foreground">
                    {st("footer.brandTitle")}
                  </strong>{" "}
                  {a("bodyAfterOrgName")}
                </p>
                <p>{a("bodyP2")}</p>
                <p>{a("bodyP3")}</p>
              </div>
            </div>
            <aside className="lg:col-span-5">
              <div className="rounded-2xl border border-border/80 bg-muted/30 p-6 shadow-sm ring-1 ring-black/[0.04] dark:bg-muted/15 dark:ring-white/5 sm:p-8">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {a("glanceHeading")}
                </h3>
                <dl className="mt-4 space-y-4 text-sm">
                  <div>
                    <dt className="font-medium text-foreground">{a("glanceOrgDt")}</dt>
                    <dd className="mt-1 text-muted-foreground">{a("glanceOrgDd")}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">{a("glanceFocusDt")}</dt>
                    <dd className="mt-1 text-muted-foreground">{a("glanceFocusDd")}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">{a("glanceContactDt")}</dt>
                    <dd className="mt-1 text-muted-foreground">
                      <Link
                        href="/contact"
                        className="text-[#2c7bb6] underline-offset-4 hover:underline dark:text-sky-400"
                      >
                        {a("glanceContactLink")}
                      </Link>
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>
          </section>

          <section
            className="mt-16 border-t border-border/60 pt-16 sm:mt-20 sm:pt-20"
            aria-labelledby="mission-heading"
          >
            <h2
              id="mission-heading"
              className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              {a("missionHeading")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              {a("missionLead")}
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{a("missionCard1Title")}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {a("missionCard1Desc")}
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">{a("missionCard2Title")}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {a("missionCard2Desc")}
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-border/80 shadow-sm sm:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">{a("missionCard3Title")}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {a("missionCard3Desc")}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>

          <section className="mt-16 text-center sm:mt-20">
            <p className="text-muted-foreground">{a("ctaLead")}</p>
            <Link
              href="/contact"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              {a("ctaButton")}
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
