import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MemberDirectoryList } from "@/components/members/member-directory-list";
import { MemberTypeTabs } from "@/components/members/member-type-tabs";
import { PageBanner } from "@/components/layout/page-banner";
import {
  MEMBER_SECTION_COPY,
  SLUG_TO_CATEGORY,
  slugFromSearchParam,
} from "@/lib/members/config";
import { getMembersByCategory } from "@/lib/members/queries";

type PageProps = {
  searchParams: Promise<{
    type?: string;
  }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { type } = await searchParams;
  const slug = slugFromSearchParam(type);
  const copy = MEMBER_SECTION_COPY[slug];
  return {
    title: copy.title,
    description: copy.subtitle,
  };
}

function TabsFallback() {
  return (
    <div
      className="mb-8 flex h-10 max-w-2xl flex-wrap gap-2"
      aria-hidden
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-10 w-36 animate-pulse rounded-full bg-muted"
        />
      ))}
    </div>
  );
}

export default async function MemberDirectoryPage({ searchParams }: PageProps) {
  const { type } = await searchParams;
  const slug = slugFromSearchParam(type);
  const category = SLUG_TO_CATEGORY[slug];
  const copy = MEMBER_SECTION_COPY[slug];
  const members = await getMembersByCategory(category);

  return (
    <>
      <PageBanner
        title={copy.title}
        subtitle={copy.subtitle}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: copy.title },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <Suspense fallback={<TabsFallback />}>
          <MemberTypeTabs className="mb-8" />
        </Suspense>

        {members.length === 0 ? (
          <p className="max-w-2xl text-muted-foreground">
            {copy.emptyMessage}
          </p>
        ) : (
          <MemberDirectoryList key={slug} members={members} />
        )}

        <p className="mt-12 text-sm text-muted-foreground">
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
