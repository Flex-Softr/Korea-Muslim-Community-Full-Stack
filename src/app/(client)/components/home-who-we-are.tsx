import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Globe2, HeartHandshake, Users } from "lucide-react";

const highlights = [
  {
    icon: Users,
    title: "Nationwide community",
    text: "Muslims living, studying, and working across Korea — connected in dignity and mutual support.",
  },
  {
    icon: BookOpen,
    title: "Learning & faith",
    text: "Study circles, programmes, and spiritual gatherings rooted in Islamic values and Korean context.",
  },
  {
    icon: Globe2,
    title: "Open & respectful",
    text: "We cooperate where goals align and welcome neighbours who share our values of service and unity.",
  },
  {
    icon: HeartHandshake,
    title: "Service & relief",
    text: "Outreach, seasonal aid, and spaces where families and newcomers can find practical help.",
  },
] as const;

export function HomeWhoWeAre() {
  return (
    <section
      className="relative overflow-hidden border-b border-border/40 bg-background"
      aria-labelledby="home-who-we-are-heading"
    >
      {/* Soft brand wash + subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(44,123,182,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.08),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--border) / 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border) / 0.5) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2c7bb6] dark:text-sky-400">
              Who we are
            </p>
            <h2
              id="home-who-we-are-heading"
              className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.35rem] lg:leading-[1.15]"
            >
              Korea Muslim Community
            </h2>
            <p className="mt-2 text-lg font-medium text-muted-foreground sm:text-xl">
              한국 무슬림 커뮤니티
            </p>
            <p className="mt-6 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              <strong className="font-semibold text-foreground">
                Korea Muslim Community
              </strong>{" "}
              is a voluntary organisation for Muslims across the Republic of Korea.
              We host programmes, spiritual activities, and outreach that reflect our
              faith while respecting Korean society and the law.
            </p>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Whether you are new to Korea or have been here for years, you are welcome
              to connect, learn, and grow with us.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/about"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2c7bb6] px-5 text-sm font-semibold text-white shadow-md shadow-[#2c7bb6]/20 transition hover:bg-[#256fa3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-2 dark:shadow-sky-500/10"
              >
                About us
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/contact"
                className="text-sm font-semibold text-foreground underline-offset-4 transition hover:text-[#2c7bb6] hover:underline dark:hover:text-sky-400"
              >
                Get in touch
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border/60 bg-muted shadow-xl ring-1 ring-black/[0.04] dark:ring-white/10 sm:aspect-[16/10] lg:aspect-auto lg:min-h-[min(100%,28rem)]">
                <Image
                  src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1400&q=80"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="max-w-md text-sm font-medium leading-relaxed text-white/95 sm:text-base">
                    Connecting Muslims through education, gatherings, and service —
                    open to everyone who shares our values.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {highlights.map(({ icon: Icon, title, text }) => (
                  <div
                    key={title}
                    className="flex gap-4 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur-sm ring-1 ring-black/[0.03] transition hover:border-[#2c7bb6]/25 hover:shadow-md dark:bg-card/60 dark:ring-white/5"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#2c7bb6]/10 text-[#2c7bb6] dark:bg-sky-400/15 dark:text-sky-400">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold tracking-tight text-foreground">
                        {title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
