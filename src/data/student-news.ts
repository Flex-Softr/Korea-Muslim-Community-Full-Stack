/** Student / community blog feed for `/blog` — separate from activity routes and data. */
export type StudentNewsPost = {
  id: string;
  /** URL segment for `/blog/[slug]`. */
  slug: string;
  /** ISO date for `<time datetime>`, archive, and sorting. */
  dateIso: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  coverImage: string;
  /** Body for the article page; paragraphs separated by `\n\n`. */
  content: string;
};

export const STUDENT_NEWS_POSTS: StudentNewsPost[] = [
  {
    id: "b1",
    slug: "welcome-back-semester-orientation",
    dateIso: "2026-03-01",
    date: "March 1, 2026",
    category: "Campus",
    title: "Welcome back: spring semester orientation",
    excerpt:
      "Student reps shared housing tips, prayer space locations, and how to join study circles in Seoul and Busan.",
    coverImage:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    content:
      "Orientation week brought together new and returning students for a practical walkthrough of life in Korea: banking basics, ARC reminders, and where to find halal groceries and prayer rooms near major campuses.\n\nStudent reps from Seoul and Busan hosted breakout sessions so questions could stay city-specific. Slides and a shared map document will stay updated in the community library for anyone who missed the live session.",
  },
  {
    id: "b2",
    slug: "library-hours-extended",
    dateIso: "2026-02-24",
    date: "February 24, 2026",
    category: "Community",
    title: "Community library hours extended on weekends",
    excerpt:
      "Saturday slots now run through early evening; volunteers are still needed for desk shifts.",
    coverImage:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80",
    content:
      "The online reservation calendar now reflects longer Saturday hours so working students and families can visit after the workday. Quiet study corners and the children’s corner both remain available.\n\nWe are still looking for two volunteers per month to help with check-in and shelving. If you can spare one Saturday a month, reach out through the consultation form.",
  },
  {
    id: "b3",
    slug: "essay-contest-announced",
    dateIso: "2026-02-18",
    date: "February 18, 2026",
    category: "Student life",
    title: "Annual essay contest theme announced",
    excerpt:
      "This year’s prompt invites reflections on civic engagement and faith; submissions open next month.",
    coverImage:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80",
    content:
      "The student committee chose a theme that connects personal values with participation in Korean society: volunteering, neighbourhood initiatives, and ethical leadership.\n\nSubmissions will open next month with word limits for Korean and English entries. Judges include alumni and a guest educator; prizes will be announced at the spring community evening.",
  },
  {
    id: "b4",
    slug: "peer-mentor-signup",
    dateIso: "2026-02-10",
    date: "February 10, 2026",
    category: "Campus",
    title: "Peer mentor signup for new international students",
    excerpt:
      "Returning students can volunteer for airport pickup, campus tours, and first-week check-ins.",
    coverImage:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    content:
      "The peer mentor programme pairs newcomers with students who already know the ropes: from subway passes to Friday prayer logistics and exam-season stress.\n\nMentors commit to a light touch—usually a first-week check-in and one follow-up. Training notes and a shared FAQ are provided so you never feel on your own.",
  },
  {
    id: "b5",
    slug: "sports-club-trial-day",
    dateIso: "2026-02-03",
    date: "February 3, 2026",
    category: "Events",
    title: "Sports club trial day — all skill levels",
    excerpt:
      "Badminton and futsal taster sessions on campus; bring indoor shoes and a water bottle.",
    coverImage:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    content:
      "Trial day is designed for beginners and regulars alike: short warm-ups, mixed doubles in badminton, and small-sided games in futsal. Coaches emphasise inclusion and rotation so everyone gets time on court.\n\nBring indoor shoes, a water bottle, and a light snack. Registration at the door helps us plan court times; see the events channel for the campus map pin.",
  },
  {
    id: "b6",
    slug: "career-panel-recap",
    dateIso: "2026-01-27",
    date: "January 27, 2026",
    category: "Career",
    title: "Career panel: working in Korea after graduation",
    excerpt:
      "Alumni answered questions on visas, language expectations, and networking across industries.",
    coverImage:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80",
    content:
      "Panelists covered E-7 and other common paths, realistic TOPIK expectations by sector, and how to translate volunteer experience into interview stories.\n\nA recording summary and anonymised Q&A notes will be posted for members who could not attend live. Thanks to everyone who submitted questions in advance.",
  },
  {
    id: "b7",
    slug: "winter-break-reading",
    dateIso: "2026-01-15",
    date: "January 15, 2026",
    category: "Student life",
    title: "Winter break reading group — online check-in",
    excerpt:
      "Three short texts and one virtual discussion; registration closes this Friday.",
    coverImage:
      "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1200&q=80",
    content:
      "The reading list stays short on purpose: three essays and one talk transcript, all available in the library folder. The online check-in is a single moderated evening with breakout rooms by language comfort.\n\nRegistration closes this Friday so facilitators can send calendar invites and accessibility requests to the venue team hosting the stream.",
  },
  {
    id: "b8",
    slug: "mental-health-resource-sheet",
    dateIso: "2026-01-08",
    date: "January 8, 2026",
    category: "Wellness",
    title: "Updated mental health resource sheet (KR / EN)",
    excerpt:
      "Crisis lines, campus counselling links, and community-trusted clinics in one PDF.",
    coverImage:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    content:
      "The sheet was reviewed with student welfare contacts and bilingual volunteers. It prioritises crisis lines first, then campus routes, then private options with notes on language support.\n\nThis is informational, not medical advice. If you spot a broken link, please flag it so we can patch the PDF quickly.",
  },
  {
    id: "b9",
    slug: "photo-contest-winners",
    dateIso: "2025-12-20",
    date: "December 20, 2025",
    category: "Community",
    title: "Fall photo contest winners",
    excerpt:
      "Judges highlighted entries that captured daily life and community gatherings.",
    coverImage:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    content:
      "Thank you to everyone who submitted. Winners balanced composition, story, and respect for people’s privacy—important ground rules we will carry into the next round.\n\nWinning images will appear in the annual slideshow and with credit lines agreed with each photographer. Honorable mentions are listed in the community newsletter.",
  },
  {
    id: "b10",
    slug: "exam-season-study-rooms",
    dateIso: "2025-12-12",
    date: "December 12, 2025",
    category: "Campus",
    title: "Shared quiet study rooms during exam season",
    excerpt:
      "Bookable slots in two neighbourhoods; bring headphones and respect prayer break times.",
    coverImage:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
    content:
      "Partners donated evening slots in two neighbourhood rooms so students without campus access still have a quiet desk. Booking is first-come through a simple form; please cancel if plans change.\n\nHeadphones are required. Short prayer breaks are blocked on the schedule so the space stays predictable for everyone.",
  },
  {
    id: "b11",
    slug: "donation-drive-thank-you",
    dateIso: "2025-12-05",
    date: "December 5, 2025",
    category: "Service",
    title: "Thank you — winter donation drive totals",
    excerpt:
      "Student volunteers sorted and labelled hundreds of items for partner organisations.",
    coverImage:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80",
    content:
      "Sorting days ran longer than expected because donations exceeded our targets—in the best way. Volunteers labelled sizes, checked winter gear, and coordinated handoffs with partner orgs.\n\nThank you to donors, drivers, and the team who kept the room organised. A short impact summary will follow once partners confirm distribution numbers.",
  },
  {
    id: "b12",
    slug: "graduation-gathering-save-date",
    dateIso: "2025-11-28",
    date: "November 28, 2025",
    category: "Events",
    title: "Save the date: graduation gathering",
    excerpt:
      "A joint celebration for winter graduates; RSVP will open after venue confirmation.",
    coverImage:
      "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80",
    content:
      "Winter graduates asked for one relaxed evening that mixes families, friends, and mentors without a formal programme. We are locking a venue that fits that tone and accessibility needs.\n\nRSVP will open after the contract is signed; expect email and a post here. If you want to help with décor or a slideshow, note your interest in the volunteer thread.",
  },
];

export function blogPostPath(slug: string): string {
  return `/blog/${slug}`;
}

export function getBlogPostBySlug(slug: string): StudentNewsPost | undefined {
  return STUDENT_NEWS_POSTS.find((p) => p.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return STUDENT_NEWS_POSTS.map((p) => p.slug);
}

/** Descending by date (newest first). */
export function postsSortedByDate(): StudentNewsPost[] {
  return [...STUDENT_NEWS_POSTS].sort(
    (a, b) => b.dateIso.localeCompare(a.dateIso),
  );
}

export function getLatestBlogPosts({
  excludeSlug,
  limit = 5,
}: {
  excludeSlug: string;
  limit?: number;
}): StudentNewsPost[] {
  return postsSortedByDate()
    .filter((p) => p.slug !== excludeSlug)
    .slice(0, limit);
}
