import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { MemberProfileContent } from "@/components/members/member-profile-content";
import { MemberProfileSidebar } from "@/components/members/member-profile-sidebar";
import { MemberProfileSocialLinks } from "@/components/members/member-profile-social-links";
import { PageBanner } from "@/components/layout/page-banner";
import {
  CATEGORY_TO_SLUG,
  MEMBER_SECTION_COPY,
  memberListingHref,
  type MemberCategory,
  type MemberSlug,
} from "@/lib/members/config";
import { canViewRestrictedProfile } from "@/lib/members/member-profile-fields";
import { getMemberById } from "@/lib/members/queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const member = await getMemberById(id);
  if (!member) {
    return { title: "Member" };
  }
  const desc =
    member.aboutSummary ??
    member.bio ??
    member.jobTitle ??
    member.title ??
    member.name;
  return {
    title: `${member.name} · Alumni profile`,
    description: desc,
  };
}

export default async function MemberDetailPage({ params }: PageProps) {
  const { id } = await params;
  const member = await getMemberById(id);
  if (!member) {
    notFound();
  }

  const session = await auth();
  const canSeeRestricted = canViewRestrictedProfile(
    member.profileVisibility,
    !!session?.user?.id,
  );

  const category = member.category as MemberCategory;
  const slug: MemberSlug = CATEGORY_TO_SLUG[category];
  const section = MEMBER_SECTION_COPY[slug];
  const listingHref = memberListingHref(slug);

  const academicLine = [member.universityKr, member.degree]
    .filter(Boolean)
    .join(" · ");
  const bannerSubtitle =
    member.jobTitle ??
    member.title ??
    member.aboutSummary ??
    (academicLine ? academicLine : null) ??
    section.subtitle;

  return (
    <>
      <PageBanner
        title={member.name}
        afterTitle={
          canSeeRestricted &&
          (member.linkedInUrl?.trim() || member.facebookUrl?.trim()) ? (
            <MemberProfileSocialLinks
              variant="banner"
              linkedInUrl={member.linkedInUrl}
              facebookUrl={member.facebookUrl}
            />
          ) : undefined
        }
        subtitle={bannerSubtitle}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: section.title, href: listingHref },
          { label: member.name },
        ]}
      />

      <article className="relative overflow-hidden border-b border-border/40">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgba(44,123,182,0.14),transparent)] dark:bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgba(56,189,248,0.1),transparent)]"
          aria-hidden
        />
        <div className="relative bg-gradient-to-b from-muted/30 via-background/80 to-muted/20 dark:from-muted/15 dark:via-background dark:to-muted/10">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
            <Link
              href={listingHref}
              className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#2c7bb6] transition-colors hover:text-[#256fa3] dark:text-sky-400 dark:hover:text-sky-300"
            >
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
              Back to {section.title.toLowerCase()}
            </Link>

            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
              <aside className="lg:col-span-4 xl:col-span-4">
                <div className="lg:sticky lg:top-24">
                  <MemberProfileSidebar
                    member={member}
                    sectionListTitle={section.title}
                    showSocialLinks={canSeeRestricted}
                  />
                </div>
              </aside>

              <div className="min-w-0 lg:col-span-8 xl:col-span-8">
                <MemberProfileContent
                  member={member}
                  canSeeRestricted={canSeeRestricted}
                  listingHref={listingHref}
                  sectionListTitle={section.title}
                  hideIdentityHeader
                />
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
