import type { Metadata } from "next";
import Link from "next/link";
import { Building2, HeartHandshake, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageBanner } from "@/components/layout/page-banner";
import { getDonationBankDetails } from "@/config/donation";
import { getRequestLang } from "@/lib/i18n/server-language";
import { getServerT, serverT } from "@/lib/i18n/server-translate";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  return {
    title: serverT(lang, "breadcrumbs.donate"),
    description: serverT(lang, "pages.donate.subtitle"),
  };
}

export default async function DonationPage() {
  const st = await getServerT();
  const bank = await getDonationBankDetails();
  const p = (key: string) => st(`pages.donate.${key}`);

  return (
    <>
      <PageBanner
        title={st("breadcrumbs.donate")}
        subtitle={st("pages.donate.subtitle")}
        breadcrumbs={[{ label: st("nav.home"), href: "/" }, { label: st("breadcrumbs.donate") }]}
      />

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 sm:px-6 sm:py-16">
        <section aria-labelledby="why-donate-heading">
          <h2
            id="why-donate-heading"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            <HeartHandshake
              className="size-7 shrink-0 text-[#2c7bb6] dark:text-sky-400"
              aria-hidden
            />
            {p("whyHeading")}
          </h2>
          <ul className="mt-6 space-y-4 text-muted-foreground">
            <li className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 size-5 shrink-0 text-[#2c7bb6] dark:text-sky-400"
                aria-hidden
              />
              <span>
                <strong className="font-medium text-foreground">
                  {p("programmesStrong")}
                </strong>{" "}
                {p("programmesBody")}
              </span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 size-5 shrink-0 text-[#2c7bb6] dark:text-sky-400"
                aria-hidden
              />
              <span>
                <strong className="font-medium text-foreground">
                  {p("reliefStrong")}
                </strong>{" "}
                {p("reliefBody")}
              </span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 size-5 shrink-0 text-[#2c7bb6] dark:text-sky-400"
                aria-hidden
              />
              <span>
                <strong className="font-medium text-foreground">
                  {p("transparencyStrong")}
                </strong>{" "}
                {p("transparencyBeforeLink")}
                <Link
                  href="/contact"
                  className="font-medium text-[#2c7bb6] underline-offset-4 hover:underline dark:text-sky-400"
                >
                  {p("transparencyLink")}
                </Link>
                {p("transparencyAfterLink")}
              </span>
            </li>
          </ul>
        </section>

        <section aria-labelledby="bank-details-heading">
          <h2
            id="bank-details-heading"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl"
          >
            <Building2
              className="size-7 shrink-0 text-[#2c7bb6] dark:text-sky-400"
              aria-hidden
            />
            {p("bankHeading")}
          </h2>
          <p className="mt-3 text-muted-foreground">{p("bankIntro")}</p>

          <Card className="mt-6 border-border/80 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/5">
            <CardHeader>
              <CardTitle>{p("accountCardTitle")}</CardTitle>
              <CardDescription>{p("accountCardDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-foreground">{p("labelBank")}</dt>
                  <dd className="mt-0.5 text-muted-foreground">
                    <span data-no-auto-translate="true">{bank.bankName}</span>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">{p("labelAccountName")}</dt>
                  <dd className="mt-0.5 text-muted-foreground">
                    <span data-no-auto-translate="true">{bank.accountName}</span>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">
                    {p("labelAccountNumber")}
                  </dt>
                  <dd className="mt-0.5 font-mono text-base text-foreground">
                    <span data-no-auto-translate="true">{bank.accountNumber}</span>
                  </dd>
                </div>
                {bank.branch ? (
                  <div>
                    <dt className="font-medium text-foreground">{p("labelBranch")}</dt>
                    <dd className="mt-0.5 text-muted-foreground">
                      <span data-no-auto-translate="true">{bank.branch}</span>
                    </dd>
                  </div>
                ) : null}
                {bank.swift ? (
                  <div>
                    <dt className="font-medium text-foreground">{p("labelSwift")}</dt>
                    <dd className="mt-0.5 font-mono text-muted-foreground">
                      <span data-no-auto-translate="true">{bank.swift}</span>
                    </dd>
                  </div>
                ) : null}
                {bank.referenceNote ? (
                  <div className="rounded-lg border border-border/80 bg-muted/40 p-3">
                    <dt className="font-medium text-foreground">{p("labelReference")}</dt>
                    <dd className="mt-1 font-mono text-sm text-muted-foreground">
                      <span data-no-auto-translate="true">{bank.referenceNote}</span>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </CardContent>
          </Card>
        </section>

        <p className="text-sm text-muted-foreground">
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
