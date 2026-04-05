import Link from "next/link";
import type { CommunityMemberProfileDTO } from "@/lib/members/queries";
import {
  formatGender,
  formatOccupationType,
  formatStudyStatus,
  parseProfileVisibility,
  PROFILE_VISIBILITY_LABELS,
} from "@/lib/members/member-profile-fields";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function ProfileSection({
  title,
  children,
  className,
  variant = "default",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  /** `highlight` = soft brand tint for bio/lead content */
  variant?: "default" | "highlight";
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-6 sm:p-7",
        variant === "highlight"
          ? "border-[#2c7bb6]/20 bg-gradient-to-br from-[#2c7bb6]/[0.07] via-transparent to-transparent dark:border-sky-500/20 dark:from-sky-500/10"
          : "border-border/70 bg-card/90 shadow-sm ring-1 ring-black/[0.03] dark:bg-card/50 dark:ring-white/[0.04]",
        className,
      )}
    >
      <h2 className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-foreground">
        <span
          className="h-2 w-2 shrink-0 rounded-full bg-[#2c7bb6] dark:bg-sky-400"
          aria-hidden
        />
        {title}
      </h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  if (value == null || value === "") {
    return null;
  }
  return (
    <div className={className}>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1.5 text-sm leading-relaxed text-foreground sm:text-[0.9375rem]">
        {value}
      </div>
    </div>
  );
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function MemberProfileContent({
  member,
  canSeeRestricted,
  listingHref,
  sectionListTitle,
  hideIdentityHeader = false,
}: {
  member: CommunityMemberProfileDTO;
  canSeeRestricted: boolean;
  listingHref: string;
  sectionListTitle: string;
  /** When true, badges/name/role are shown in the sidebar; omit duplicate header. */
  hideIdentityHeader?: boolean;
}) {
  const visibility = parseProfileVisibility(member.profileVisibility);
  const showMembersOnlyGate =
    visibility === "MEMBERS_ONLY" && !canSeeRestricted;

  const genderLabel = formatGender(member.gender);
  let dobDisplay: string | null = null;
  if (canSeeRestricted && member.dateOfBirth) {
    dobDisplay = member.dateOfBirthYearOnly
      ? String(member.dateOfBirth.getUTCFullYear())
      : formatDate(member.dateOfBirth);
  }

  const hasContact =
    !!member.contactEmail ||
    !!member.phone ||
    !!member.whatsApp ||
    !!member.kakaoId ||
    !!member.linkedInUrl ||
    !!member.facebookUrl;

  const hasJourney =
    member.yearArrivalKorea != null ||
    !!member.visaType ||
    !!member.scholarshipInfo ||
    !!member.educationBangladesh;

  const hasAchievements =
    !!member.awards ||
    !!member.publications ||
    !!member.researchPapers ||
    !!member.scholarshipsHonors;

  const hasActivityStats =
    member.activityPostsCount != null ||
    member.activityCommentsCount != null ||
    member.activityEventsCount != null ||
    !!member.activityNotes;

  const linkClass =
    "font-medium text-[#2c7bb6] underline-offset-4 transition-colors hover:text-[#256fa3] hover:underline dark:text-sky-400 dark:hover:text-sky-300";

  return (
    <div className="space-y-6">
      {!hideIdentityHeader ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-normal">
              {sectionListTitle}
            </Badge>
            {member.memberCode ? (
              <Badge variant="outline" className="font-mono text-xs font-normal">
                ID {member.memberCode}
              </Badge>
            ) : null}
            <Badge variant="outline" className="text-xs font-normal">
              {PROFILE_VISIBILITY_LABELS[visibility]}
            </Badge>
          </div>
          {member.nameBn ? (
            <p className="mt-3 text-lg text-muted-foreground" lang="bn">
              {member.nameBn}
            </p>
          ) : null}
          {(() => {
            const parts = [
              member.title,
              member.jobTitle,
              formatOccupationType(member.occupationType),
            ].filter((x): x is string => !!x);
            return parts.length > 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {parts.join(" · ")}
              </p>
            ) : null;
          })()}
        </>
      ) : null}

      <ProfileSection title="Bio & about" variant="highlight">
        {member.aboutSummary ? (
          <p className="text-lg font-medium leading-relaxed text-foreground sm:text-xl">
            {member.aboutSummary}
          </p>
        ) : null}
        {member.bio ? (
          <div
            className={cn(
              "space-y-4 text-base leading-[1.65] text-foreground/95",
              member.aboutSummary
                ? "mt-4 border-t border-[#2c7bb6]/15 pt-4 dark:border-sky-500/15"
                : "",
            )}
          >
            {member.bio.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ) : null}
        {!member.aboutSummary && !member.bio ? (
          <p className="text-sm text-muted-foreground">
            No bio or short introduction has been added yet.
          </p>
        ) : null}
      </ProfileSection>

      <ProfileSection title="Basic identity">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Gender" value={genderLabel} />
          <Field label="Date of birth" value={dobDisplay} />
          <Field
            label="Home division (Bangladesh)"
            value={member.homeDivisionBd}
          />
          <Field
            label="Home district"
            value={member.homeDistrictBd}
          />
        </div>
        {!canSeeRestricted && visibility === "MEMBERS_ONLY" ? (
          <p className="text-sm text-muted-foreground">
            Date of birth is visible to signed-in members only.
          </p>
        ) : null}
      </ProfileSection>

      <ProfileSection title="Academic (Korea)">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="University" value={member.universityKr} />
          <Field label="Degree" value={member.degree} />
          <Field label="Major / subject" value={member.major} />
          <Field
            label="Study status"
            value={formatStudyStatus(member.studyStatus)}
          />
          <Field
            label="Year of admission"
            value={
              member.yearAdmission != null ? String(member.yearAdmission) : null
            }
          />
          <Field
            label="Graduation year"
            value={
              member.graduationYear != null
                ? String(member.graduationYear)
                : null
            }
          />
        </div>
      </ProfileSection>

      <ProfileSection title="Current status">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Location"
            value={member.locationCity}
            className="sm:col-span-2"
          />
          <Field label="Company / organisation" value={member.companyName} />
          <Field label="Job title" value={member.jobTitle} />
        </div>
      </ProfileSection>

      <ProfileSection title="Achievements & documents">
        {hasAchievements ? (
          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              label="Awards"
              value={
                member.awards ? (
                  <span className="whitespace-pre-wrap">{member.awards}</span>
                ) : null
              }
              className="sm:col-span-2"
            />
            <Field
              label="Publications"
              value={
                member.publications ? (
                  <span className="whitespace-pre-wrap">{member.publications}</span>
                ) : null
              }
              className="sm:col-span-2"
            />
            <Field
              label="Research papers"
              value={
                member.researchPapers ? (
                  <span className="whitespace-pre-wrap">{member.researchPapers}</span>
                ) : null
              }
              className="sm:col-span-2"
            />
            <Field
              label="Scholarships & honors"
              value={
                member.scholarshipsHonors ? (
                  <span className="whitespace-pre-wrap">
                    {member.scholarshipsHonors}
                  </span>
                ) : null
              }
              className="sm:col-span-2"
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No awards, publications, or honors listed yet.
          </p>
        )}
      </ProfileSection>

      <ProfileSection title="Skills & expertise">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Technical / professional skills"
            value={
              member.skillsTechnical ? (
                <span className="whitespace-pre-wrap">{member.skillsTechnical}</span>
              ) : null
            }
            className="sm:col-span-2"
          />
          <Field label="Korean / TOPIK" value={member.koreanLevelTopik} />
          <Field
            label="Certifications"
            value={
              member.certifications ? (
                <span className="whitespace-pre-wrap">{member.certifications}</span>
              ) : null
            }
            className="sm:col-span-2"
          />
        </div>
      </ProfileSection>

      {showMembersOnlyGate ? (
        <section className="rounded-2xl border border-dashed border-[#2c7bb6]/35 bg-[#2c7bb6]/[0.04] p-6 dark:border-sky-500/30 dark:bg-sky-500/5 sm:p-7">
          <h2 className="text-base font-semibold text-foreground">
            Contact & journey
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Contact details, social links, and Korea journey information on this
            profile are limited to{" "}
            <strong className="text-foreground">signed-in members</strong>. Log in
            with your association account to view them.
          </p>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/member/${member.id}`)}`}
            className={cn(
              "mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-[#2c7bb6] px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#256fa3] dark:bg-sky-600 dark:hover:bg-sky-500",
            )}
          >
            Sign in to view
          </Link>
        </section>
      ) : (
        <>
          <ProfileSection title="Contact">
            {hasContact ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  label="Email"
                  value={
                    member.contactEmail ? (
                      <a className={linkClass} href={`mailto:${member.contactEmail}`}>
                        {member.contactEmail}
                      </a>
                    ) : null
                  }
                  className="sm:col-span-2"
                />
                <Field
                  label="Phone"
                  value={
                    member.phone ? (
                      <a
                        className={linkClass}
                        href={`tel:${member.phone.replace(/\s/g, "")}`}
                      >
                        {member.phone}
                      </a>
                    ) : null
                  }
                />
                <Field label="WhatsApp" value={member.whatsApp} />
                <Field label="KakaoTalk ID" value={member.kakaoId} />
                <Field
                  label="LinkedIn"
                  value={
                    member.linkedInUrl ? (
                      <a
                        href={member.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(linkClass, "break-all")}
                      >
                        {member.linkedInUrl}
                      </a>
                    ) : null
                  }
                  className="sm:col-span-2"
                />
                <Field
                  label="Facebook"
                  value={
                    member.facebookUrl ? (
                      <a
                        href={member.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(linkClass, "break-all")}
                      >
                        {member.facebookUrl}
                      </a>
                    ) : null
                  }
                  className="sm:col-span-2"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No contact information listed.
              </p>
            )}
          </ProfileSection>

          <ProfileSection title="Journey to Korea (for newcomers)">
            {hasJourney ? (
              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  label="Year of arrival in Korea"
                  value={
                    member.yearArrivalKorea != null
                      ? String(member.yearArrivalKorea)
                      : null
                  }
                />
                <Field label="Visa type" value={member.visaType} />
                <Field
                  label="Scholarship / funding"
                  value={
                    member.scholarshipInfo ? (
                      <span className="whitespace-pre-wrap">
                        {member.scholarshipInfo}
                      </span>
                    ) : null
                  }
                  className="sm:col-span-2"
                />
                <Field
                  label="Previous education (Bangladesh)"
                  value={
                    member.educationBangladesh ? (
                      <span className="whitespace-pre-wrap">
                        {member.educationBangladesh}
                      </span>
                    ) : null
                  }
                  className="sm:col-span-2"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No journey details added yet.
              </p>
            )}
          </ProfileSection>
        </>
      )}

      <ProfileSection title="Activity & engagement">
        {hasActivityStats ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {member.activityPostsCount != null ? (
                <div className="rounded-xl border border-border/60 bg-gradient-to-b from-[#2c7bb6]/10 to-transparent px-4 py-4 text-center dark:from-sky-500/10">
                  <p className="text-3xl font-bold tabular-nums tracking-tight text-[#2c7bb6] dark:text-sky-400">
                    {member.activityPostsCount}
                  </p>
                  <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Posts
                  </p>
                </div>
              ) : null}
              {member.activityCommentsCount != null ? (
                <div className="rounded-xl border border-border/60 bg-gradient-to-b from-[#2c7bb6]/10 to-transparent px-4 py-4 text-center dark:from-sky-500/10">
                  <p className="text-3xl font-bold tabular-nums tracking-tight text-[#2c7bb6] dark:text-sky-400">
                    {member.activityCommentsCount}
                  </p>
                  <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Comments
                  </p>
                </div>
              ) : null}
              {member.activityEventsCount != null ? (
                <div className="rounded-xl border border-border/60 bg-gradient-to-b from-[#2c7bb6]/10 to-transparent px-4 py-4 text-center dark:from-sky-500/10">
                  <p className="text-3xl font-bold tabular-nums tracking-tight text-[#2c7bb6] dark:text-sky-400">
                    {member.activityEventsCount}
                  </p>
                  <p className="mt-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Events
                  </p>
                </div>
              ) : null}
            </div>
            <Field
              label="Highlights"
              value={
                member.activityNotes ? (
                  <span className="whitespace-pre-wrap">{member.activityNotes}</span>
                ) : null
              }
              className="sm:col-span-2"
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Activity counts will appear here when posts, comments, and events are
            linked to member profiles. Admins can add highlights in the meantime.
          </p>
        )}
      </ProfileSection>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-8">
        <Link href={listingHref} className={cn(linkClass, "inline-flex items-center gap-2 text-sm")}>
          <span aria-hidden>←</span>
          All {sectionListTitle.toLowerCase()}
        </Link>
      </div>
    </div>
  );
}
