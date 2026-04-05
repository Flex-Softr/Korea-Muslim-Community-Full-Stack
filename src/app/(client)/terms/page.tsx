import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/layout/page-banner";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of service placeholder for your product.",
};

export default function TermsPage() {
  return (
    <>
      <PageBanner
        title="Terms of service"
        subtitle="Rules for using this website and related services."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Terms of service" },
        ]}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-muted-foreground">
          This is placeholder content for a generic starter. Replace it with
          terms reviewed by qualified counsel for your jurisdiction and use
          case.
        </p>
        <ul className="mt-8 list-inside list-disc space-y-3 text-sm text-foreground/90">
          <li>Acceptable use, account eligibility, and termination.</li>
          <li>Limitation of liability and disclaimers.</li>
          <li>Governing law and dispute resolution.</li>
          <li>How you may change these terms and notify users.</li>
        </ul>
        <p className="mt-10 text-sm">
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
