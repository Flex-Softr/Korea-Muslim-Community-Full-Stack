import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy policy placeholder for your product.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Privacy policy
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
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
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
