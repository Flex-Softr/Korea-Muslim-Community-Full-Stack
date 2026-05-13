import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MemberDirectoryList } from "@/components/members/member-directory-list";
import { MemberTypeTabs } from "@/components/members/member-type-tabs";
import { PageBanner } from "@/components/layout/page-banner";
import {
  MEMBER_SECTION_I18N_KEYS,
  SLUG_TO_CATEGORY,
  slugFromSearchParam,
} from "@/lib/members/config";
import { getMembersByCategory } from "@/lib/members/queries";
import { getRequestLang } from "@/lib/i18n/server-language";
import { getServerT, serverT } from "@/lib/i18n/server-translate";

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
  const keys = MEMBER_SECTION_I18N_KEYS[slug];
  const lang = await getRequestLang();
  return {
    title: serverT(lang, keys.title),
    description: serverT(lang, keys.subtitle),
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
  const st = await getServerT();
  const { type } = await searchParams;
  const slug = slugFromSearchParam(type);
  const category = SLUG_TO_CATEGORY[slug];
  const keys = MEMBER_SECTION_I18N_KEYS[slug];
  const members = await getMembersByCategory(category);

  return (
    <>
      <PageBanner
        title={st(keys.title)}
        subtitle={st(keys.subtitle)}
        breadcrumbs={[
          { label: st("nav.home"), href: "/" },
          { label: st(keys.title) },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <Suspense fallback={<TabsFallback />}>
          <MemberTypeTabs className="mb-8" />
        </Suspense>

        {members.length === 0 ? (
          <p className="max-w-2xl text-muted-foreground">
            {st(keys.emptyMessage)}
          </p>
        ) : (
          <MemberDirectoryList key={slug} members={members} />
        )}

        <p className="mt-12 text-sm text-muted-foreground">
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
