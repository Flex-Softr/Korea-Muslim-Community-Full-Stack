import Image from "next/image";
import { BookOpen, Briefcase, GraduationCap, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CommunityMemberProfileDTO } from "@/lib/members/queries";
import {
  formatOccupationType,
  formatStudyStatus,
  parseProfileVisibility,
  PROFILE_VISIBILITY_LABELS,
} from "@/lib/members/member-profile-fields";
import { MemberProfileSocialLinks } from "@/components/members/member-profile-social-links";
import { cn } from "@/lib/utils";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase() || a.toUpperCase() || "?";
}

function QuickRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) {
    return null;
  }
  return (
    <div className="flex gap-3">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-[#2c7bb6] opacity-80 dark:text-sky-400"
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-medium leading-snug text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function MemberProfileSidebar({
  member,
  sectionListTitle,
  showSocialLinks = true,
}: {
  member: CommunityMemberProfileDTO;
  sectionListTitle: string;
  /** When false, LinkedIn/Facebook are hidden (e.g. members-only profile, guest). */
  showSocialLinks?: boolean;
}) {
  const label = initialsFromName(member.name);
  const visibility = parseProfileVisibility(member.profileVisibility);
  const studyLabel = formatStudyStatus(member.studyStatus);
  const occLabel = formatOccupationType(member.occupationType);
  const roleLine = [member.title, member.jobTitle].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg ring-1 ring-black/[0.04] dark:ring-white/[0.06]",
        )}
      >
        <div className="relative aspect-[4/5] w-full bg-muted sm:aspect-square lg:aspect-[4/5]">
          {member.imageUrl ? (
            <Image
              src={member.imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 360px"
              priority
            />
          ) : (
            <div
              className="flex size-full items-center justify-center bg-gradient-to-br from-[#2c7bb6]/20 via-[#2c7bb6]/10 to-muted dark:from-sky-950/50 dark:via-sky-900/20"
              aria-hidden
            >
              <span className="text-5xl font-bold tracking-tight text-[#2c7bb6] dark:text-sky-300 sm:text-6xl">
                {label}
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent pt-24 pb-4 px-4 sm:pt-28">
            <p className="text-xs font-medium uppercase tracking-wider text-white/80">
              {sectionListTitle}
            </p>
            <p className="mt-0.5 text-xl font-bold leading-tight text-white text-balance sm:text-2xl">
              {member.name}
            </p>
            {member.nameBn ? (
              <p className="mt-1 text-sm text-white/90" lang="bn">
                {member.nameBn}
              </p>
            ) : null}
            {showSocialLinks &&
            (member.linkedInUrl?.trim() || member.facebookUrl?.trim()) ? (
              <div className="pointer-events-auto mt-2">
                <MemberProfileSocialLinks
                  variant="sidebar"
                  linkedInUrl={member.linkedInUrl}
                  facebookUrl={member.facebookUrl}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm ring-1 ring-black/[0.03] dark:bg-card/80 dark:ring-white/5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-0 bg-[#2c7bb6]/12 text-[#256fa3] hover:bg-[#2c7bb6]/18 dark:bg-sky-500/15 dark:text-sky-300">
            {sectionListTitle}
          </Badge>
          {member.memberCode ? (
            <Badge variant="outline" className="font-mono text-[0.65rem] font-normal">
              {member.memberCode}
            </Badge>
          ) : null}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {PROFILE_VISIBILITY_LABELS[visibility]}
        </p>

        {roleLine ? (
          <p className="mt-4 text-sm font-medium leading-snug text-foreground">
            {roleLine}
          </p>
        ) : null}
        {occLabel ? (
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Briefcase className="size-3.5 shrink-0 opacity-70" aria-hidden />
            {occLabel}
          </p>
        ) : null}

        <div className="mt-5 space-y-4 border-t border-border/60 pt-5">
          <QuickRow
            icon={GraduationCap}
            label="Studies (Korea)"
            value={
              [member.universityKr, member.degree].filter(Boolean).join(" · ") ||
              undefined
            }
          />
          <QuickRow
            icon={MapPin}
            label="Location"
            value={member.locationCity ?? undefined}
          />
          {studyLabel ? (
            <QuickRow
              icon={BookOpen}
              label="Study status"
              value={studyLabel}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
