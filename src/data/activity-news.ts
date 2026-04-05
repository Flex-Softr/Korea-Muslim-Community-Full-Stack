export type ActivityNewsItem = {
  id: string;
  /** URL segment for `/activity/[slug]` — not shared with blog routes. */
  slug: string;
  /** ISO date for `<time datetime>` when available. */
  dateIso?: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  imageSrc: string;
  /** Body copy for the activity detail page (paragraphs separated by `\n\n`). */
  content: string;
};

/** Featured story on the home / “our activity” section (also has its own detail URL). */
export const ACTIVITY_FEATURED: ActivityNewsItem = {
  id: "feat-1",
  slug: "annual-quran-study-circle-seoul",
  dateIso: "2026-03-15",
  date: "March 15, 2026",
  category: "Community",
  title: "Annual Quran study circle opens in Seoul",
  excerpt:
    "Members from several cities joined the launch session. Organisers shared the semester schedule, guest teachers, and how newcomers can take part in person and online.",
  imageSrc:
    "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=80",
  content:
    "The Korea Muslim Community launched its annual Quran study circle with a full house in Seoul. Attendees heard an overview of the semester, met facilitators, and learned how sessions balance recitation, reflection, and practical discussion.\n\nOrganisers outlined options for in-person and online participation so members in other cities can follow along. Registration remains open for newcomers; details are shared through community channels and at Friday gatherings.",
};

export const ACTIVITY_NEWS: ActivityNewsItem[] = [
  {
    id: "n1",
    slug: "winter-care-packs-incheon-suwon",
    dateIso: "2026-03-08",
    date: "March 8, 2026",
    category: "Service",
    title: "Winter care packs reach families in Incheon and Suwon",
    excerpt:
      "Volunteers delivered warm clothing and staples in partnership with local mosques and social workers.",
    imageSrc:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80",
    content:
      "Volunteers assembled and delivered winter care packs to families identified through partner mosques and social services in Incheon and Suwon. Each pack included warm clothing, basic staples, and information on local support lines.\n\nThe programme relied on donations and sorting days hosted by community members. Organisers thank everyone who contributed time or goods and note that a spring follow-up distribution is being planned.",
  },
  {
    id: "n2",
    slug: "open-forum-civic-life-korea",
    dateIso: "2026-02-28",
    date: "February 28, 2026",
    category: "Debate",
    title: "Open forum on civic life and responsibility in Korea",
    excerpt:
      "Panelists and attendees discussed voting, volunteering, and how Muslims can contribute to Korean society with confidence.",
    imageSrc:
      "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=600&q=80",
    content:
      "Panelists from civil society and the community facilitated an open forum on voting, volunteering, and everyday civic participation. Breakout discussions allowed attendees to share experiences and concerns in a respectful setting.\n\nTakeaways included practical resources on registration and local initiatives, plus a commitment to host smaller follow-up circles by district. Notes and slides will be circulated to registered participants only.",
  },
  {
    id: "n3",
    slug: "photo-walk-seoul-heritage",
    dateIso: "2026-02-20",
    date: "February 20, 2026",
    category: "Culture",
    title: "Photo walk captures Seoul heritage and shared stories",
    excerpt:
      "Participants shared images in an online exhibition; proceeds from prints support a community reading space.",
    imageSrc:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80",
    content:
      "Photographers of all levels joined a guided walk through historic neighbourhoods, with prompts on light, composition, and storytelling. Submissions were curated into a modest online exhibition open to the public.\n\nOptional print sales are directed toward a community reading space. The organisers emphasised that the walk was as much about conversation and connection as it was about the final images.",
  },
  {
    id: "n4",
    slug: "new-member-reading-list-online",
    dateIso: "2026-02-10",
    date: "February 10, 2026",
    category: "Statement",
    title: "New-member reading list published online",
    excerpt:
      "Twelve titles cover Islamic history, ethics, and life as a Muslim in Korea — available through the online library.",
    imageSrc:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    content:
      "A curated reading list for new members is now available through the community’s online library portal. Titles span introductory ethics, history, and reflections on life as a Muslim in Korea, with notes on language availability.\n\nLibrarians welcome suggestions for the next revision and remind members that physical copies can be borrowed where stocked. Access instructions are posted alongside the list.",
  },
  {
    id: "n5",
    slug: "free-health-screening-day-200-members",
    dateIso: "2026-02-02",
    date: "February 2, 2026",
    category: "Health",
    title: "Free health screening day serves 200 community members",
    excerpt:
      "Partner clinics provided screenings and referrals; volunteers helped with registration and interpretation.",
    imageSrc:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    content:
      "Partner clinics offered blood pressure, glucose, and basic wellness checks alongside referrals where needed. Volunteers supported registration, wayfinding, and interpretation in several languages.\n\nRoughly two hundred people were seen across the day. Organisers and clinic leads debriefed on timing and accessibility; feedback will shape the next screening event.",
  },
  {
    id: "n6",
    slug: "community-sports-day-library-funds",
    dateIso: "2026-01-22",
    date: "January 22, 2026",
    category: "Sports",
    title: "Community sports day raises funds for library shelves",
    excerpt:
      "Families and youth teams joined a weekend tournament; ticket sales and local sponsors matched a donor pledge.",
    imageSrc:
      "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80",
    content:
      "Families and youth teams competed in a friendly weekend tournament with food stalls and a small awards ceremony. Ticket sales and sponsor contributions were matched against a donor pledge for the community library.\n\nFunds are earmarked for shelving and children’s titles. Thank-you messages will go out to teams, referees, and everyone who showed up to cheer.",
  },
  {
    id: "n7",
    slug: "weekend-arabic-circle-busan",
    dateIso: "2026-01-12",
    date: "January 12, 2026",
    category: "Education",
    title: "Weekend Arabic conversation circle expands to Busan",
    excerpt:
      "New facilitators joined from the local university; beginners and advanced learners now meet in parallel rooms with shared tea after class.",
    imageSrc:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
    content:
      "The weekend Arabic conversation circle opened a Busan chapter with facilitators from the local university community. Beginner and advanced groups meet in parallel before joining for tea and informal practice.\n\nOrganisers shared schedules and classroom norms at a short orientation. Interest lists are open for a possible mid-week online slot later in the year.",
  },
  {
    id: "n8",
    slug: "welcome-desk-friday-prayer",
    dateIso: "2026-01-05",
    date: "January 5, 2026",
    category: "Community",
    title: "New welcome desk opens at Friday prayer location",
    excerpt:
      "Trained greeters offer maps, prayer times, and introductions for visitors and new residents — in Korean, English, and Arabic.",
    imageSrc:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    content:
      "A volunteer welcome desk now operates at the main Friday prayer venue. Greeters offer maps, prayer times, and introductions for visitors and new residents, with support in Korean, English, and Arabic where available.\n\nTraining emphasised dignity, privacy, and clear signposting to ablution and prayer areas. Feedback cards help the team refine materials week to week.",
  },
  {
    id: "n9",
    slug: "winter-shelter-support-pledge",
    dateIso: "2025-12-28",
    date: "December 28, 2025",
    category: "Partnership",
    title: "Local NGO and KMC sign winter shelter support pledge",
    excerpt:
      "Joint volunteering slots and shared transport help guests reach warm overnight spaces during cold snaps in the capital region.",
    imageSrc:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773f?auto=format&fit=crop&w=800&q=80",
    content:
      "KMC and a local NGO signed a winter pledge coordinating volunteer shifts and shared transport so guests can reach overnight shelter capacity during cold snaps in the capital region.\n\nThe agreement covers communication protocols and safety training for drivers and escorts. Both parties will review impact metrics at the end of the season.",
  },
];

const bySlug = new Map<string, ActivityNewsItem>();

/** Single ordered list: featured first in data, then listing items (no duplicate slugs). */
export const ALL_ACTIVITY_ITEMS: ActivityNewsItem[] = [
  ACTIVITY_FEATURED,
  ...ACTIVITY_NEWS,
];

for (const item of ALL_ACTIVITY_ITEMS) {
  bySlug.set(item.slug, item);
}

/** Resolve an activity story for detail pages — includes the featured item and listing items only (no duplicate). */
export function getActivityBySlug(slug: string): ActivityNewsItem | undefined {
  return bySlug.get(slug);
}

/**
 * Newest-first activity items for sidebars (by `dateIso`, then listing order).
 * Excludes the current detail slug when provided.
 */
export function getLatestActivityItems({
  excludeSlug,
  limit = 5,
}: {
  excludeSlug?: string;
  limit?: number;
}): ActivityNewsItem[] {
  const filtered = excludeSlug
    ? ALL_ACTIVITY_ITEMS.filter((item) => item.slug !== excludeSlug)
    : [...ALL_ACTIVITY_ITEMS];

  const sorted = [...filtered].sort((a, b) => {
    const da = a.dateIso ?? "";
    const db = b.dateIso ?? "";
    if (da !== db) {
      return db.localeCompare(da);
    }
    return 0;
  });

  return sorted.slice(0, limit);
}

export function getAllActivitySlugs(): string[] {
  return Array.from(bySlug.keys());
}

export function activityDetailPath(slug: string): string {
  return `/activity/${slug}`;
}

/** Distinct categories on the activity listing page (`ACTIVITY_NEWS` only). */
export function getActivityListingCategories(): string[] {
  const set = new Set(ACTIVITY_NEWS.map((item) => item.category));
  return [...set].sort((a, b) => a.localeCompare(b));
}
