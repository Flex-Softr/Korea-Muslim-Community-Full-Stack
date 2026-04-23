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

export const metadata: Metadata = {
  title: "Donate",
  description:
    "Support Korea Muslim Community — why we need your help and how to give by bank transfer.",
};

export default async function DonationPage() {
  const bank = await getDonationBankDetails();

  return (
    <>
      <PageBanner
        title="Donate"
        subtitle="Help us run programmes, support families, and keep community spaces open for Muslims across Korea."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Donate" }]}
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
            Why your donation matters
          </h2>
          <ul className="mt-6 space-y-4 text-muted-foreground">
            <li className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 size-5 shrink-0 text-[#2c7bb6] dark:text-sky-400"
                aria-hidden
              />
              <span>
                <strong className="font-medium text-foreground">
                  Programmes &amp; events.
                </strong>{" "}
                Donations cover venues, materials, and speakers for education,
                spiritual gatherings, and community activities.
              </span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 size-5 shrink-0 text-[#2c7bb6] dark:text-sky-400"
                aria-hidden
              />
              <span>
                <strong className="font-medium text-foreground">
                  Relief and mutual aid.
                </strong>{" "}
                We assist members facing hardship and coordinate seasonal
                support where it is needed most.
              </span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck
                className="mt-0.5 size-5 shrink-0 text-[#2c7bb6] dark:text-sky-400"
                aria-hidden
              />
              <span>
                <strong className="font-medium text-foreground">
                  Transparency &amp; dignity.
                </strong>{" "}
                Funds are used responsibly; if you need a receipt or have
                questions, reach out through our{" "}
                <Link
                  href="/contact"
                  className="font-medium text-[#2c7bb6] underline-offset-4 hover:underline dark:text-sky-400"
                >
                  contact page
                </Link>
                .
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
            Bank transfer
          </h2>
          <p className="mt-3 text-muted-foreground">
            You can support us by domestic or international transfer. Please use
            the reference note if one is provided so we can match your gift.
          </p>

          <Card className="mt-6 border-border/80 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/5">
            <CardHeader>
              <CardTitle>Account details</CardTitle>
              <CardDescription>
                Use the information below exactly as shown.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-foreground">Bank</dt>
                  <dd className="mt-0.5 text-muted-foreground">
                    <span data-no-auto-translate="true">{bank.bankName}</span>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Account name</dt>
                  <dd className="mt-0.5 text-muted-foreground">
                    <span data-no-auto-translate="true">{bank.accountName}</span>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">
                    Account number
                  </dt>
                  <dd className="mt-0.5 font-mono text-base text-foreground">
                    <span data-no-auto-translate="true">{bank.accountNumber}</span>
                  </dd>
                </div>
                {bank.branch ? (
                  <div>
                    <dt className="font-medium text-foreground">Branch</dt>
                    <dd className="mt-0.5 text-muted-foreground">
                      <span data-no-auto-translate="true">{bank.branch}</span>
                    </dd>
                  </div>
                ) : null}
                {bank.swift ? (
                  <div>
                    <dt className="font-medium text-foreground">
                      SWIFT / BIC
                    </dt>
                    <dd className="mt-0.5 font-mono text-muted-foreground">
                      <span data-no-auto-translate="true">{bank.swift}</span>
                    </dd>
                  </div>
                ) : null}
                {bank.referenceNote ? (
                  <div className="rounded-lg border border-border/80 bg-muted/40 p-3">
                    <dt className="font-medium text-foreground">
                      Transfer reference / memo
                    </dt>
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
            ← Back to home
          </Link>
        </p>
      </div>
    </>
  );
}
