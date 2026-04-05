import Image from "next/image";
import Link from "next/link";
import type { CommunityMemberListDTO } from "@/lib/members/queries";
import { memberDetailHref } from "@/lib/members/config";
import { formatOccupationType } from "@/lib/members/member-profile-fields";
import { cn } from "@/lib/utils";

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase() || a.toUpperCase() || "?";
}

function cardSubtitle(member: CommunityMemberListDTO) {
  const occ = formatOccupationType(member.occupationType);
  const parts = [member.title, member.jobTitle, occ].filter(
    (x): x is string => !!x,
  );
  return parts.length ? parts.join(" · ") : null;
}

export function MemberCard({ member }: { member: CommunityMemberListDTO }) {
  const label = initialsFromName(member.name);
  const subtitle = cardSubtitle(member);
  const bdHome =
    member.homeDistrictBd && member.homeDivisionBd
      ? `${member.homeDistrictBd}, ${member.homeDivisionBd}`
      : member.homeDivisionBd
        ? member.homeDivisionBd
        : null;
  const meta = [member.universityKr, member.degree, member.locationCity, bdHome]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={memberDetailHref(member.id)}
      aria-label={`View profile: ${member.name}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm ring-1 ring-black/[0.04] transition-shadow hover:shadow-md dark:ring-white/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-2 dark:focus-visible:ring-sky-400/60",
      )}
    >
      <article className="flex h-full min-h-0 flex-1 flex-col">
        <div className="relative aspect-[4/3] w-full shrink-0 bg-muted">
          {member.imageUrl ? (
            <Image
              src={member.imageUrl}
              alt=""
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div
              className="flex size-full items-center justify-center bg-[#2c7bb6]/15 text-2xl font-semibold tracking-tight text-[#2c7bb6] dark:bg-sky-950/40 dark:text-sky-300"
              aria-hidden
            >
              {label}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-[#2c7bb6] dark:group-hover:text-sky-400">
            {member.name}
          </h3>
          {member.nameBn ? (
            <p className="mt-1 text-sm text-muted-foreground" lang="bn">
              {member.nameBn}
            </p>
          ) : null}
          {subtitle ? (
            <p className="mt-1 text-sm font-medium text-[#2c7bb6] dark:text-sky-400">
              {subtitle}
            </p>
          ) : null}
          {meta ? (
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
              {meta}
            </p>
          ) : null}
          {member.aboutSummary || member.bio ? (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {member.aboutSummary ?? member.bio}
            </p>
          ) : null}
          <p className="mt-4 text-xs font-medium text-[#2c7bb6] dark:text-sky-400">
            View profile →
          </p>
        </div>
      </article>
    </Link>
  );
}
