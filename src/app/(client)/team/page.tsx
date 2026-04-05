import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/layout/page-banner";

export const metadata: Metadata = {
  title: "Team",
};

export default function TeamPage() {
  return (
    <>
      <PageBanner
        title="Team"
        subtitle="Responsible members and coordinators — profiles and roles will be listed here."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Team" }]}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-muted-foreground">
          Add photos, names, and portfolios when you are ready to publish your
          leadership directory.
        </p>
        <p className="mt-8 text-sm">
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
