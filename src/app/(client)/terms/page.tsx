import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of service placeholder for your product.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Terms of service
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        This is placeholder content for a generic starter. Replace it with terms
        reviewed by qualified counsel for your jurisdiction and use case.
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
  );
}
