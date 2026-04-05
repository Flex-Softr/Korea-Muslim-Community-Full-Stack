import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageBanner } from "@/components/layout/page-banner";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Korea Muslim Community — who we are, what we do, and how we support Muslims across the Republic of Korea.",
};

export default function AboutPage() {
  return (
    <>
      <PageBanner
        title="About us"
        subtitle="Who we are, what we stand for, and how we serve Muslims and friends of the community in Korea."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "About us" },
        ]}
      />

      <div className="border-b border-border/60 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <section
            id="who-we-are"
            aria-labelledby="who-we-are-heading"
            className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-14"
          >
            <div className="lg:col-span-7">
              <h2
                id="who-we-are-heading"
                className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                Who we are
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                <p>
                  <strong className="font-semibold text-foreground">
                    Korea Muslim Community
                  </strong>{" "}
                  (한국 무슬림 커뮤니티) is a community organisation for Muslims
                  living, studying, and working across the Republic of Korea.
                  We welcome families, students, professionals, and new arrivals
                  who want to connect, learn, and support one another.
                </p>
                <p>
                  We host gatherings, educational programs, spiritual activities,
                  and outreach that reflect Islamic values while respecting
                  Korean law and the diverse society we share. Our work is
                  voluntary, transparent, and open to cooperation with other
                  groups where goals align.
                </p>
                <p>
                  This website shares public updates, resources, and ways to get
                  involved. For membership services and internal tools, signed-in
                  members can use the dashboard.
                </p>
              </div>
            </div>
            <aside className="lg:col-span-5">
              <div className="rounded-2xl border border-border/80 bg-muted/30 p-6 shadow-sm ring-1 ring-black/[0.04] dark:bg-muted/15 dark:ring-white/5 sm:p-8">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  At a glance
                </h3>
                <dl className="mt-4 space-y-4 text-sm">
                  <div>
                    <dt className="font-medium text-foreground">Organisation</dt>
                    <dd className="mt-1 text-muted-foreground">
                      Korea Muslim Community — nationwide, member-driven
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Focus</dt>
                    <dd className="mt-1 text-muted-foreground">
                      Faith, education, mutual aid, civic participation, and
                      welcoming new Muslims and residents.
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Contact</dt>
                    <dd className="mt-1 text-muted-foreground">
                      <Link
                        href="/contact"
                        className="text-[#2c7bb6] underline-offset-4 hover:underline dark:text-sky-400"
                      >
                        Reach our team
                      </Link>
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>
          </section>

          <section
            className="mt-16 border-t border-border/60 pt-16 sm:mt-20 sm:pt-20"
            aria-labelledby="mission-heading"
          >
            <h2
              id="mission-heading"
              className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Mission &amp; approach
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              We help Muslims in Korea thrive in faith and daily life — through
              reliable information, community programmes, and practical support.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Education &amp; guidance</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Talks, study circles, and resources in Korean and English so
                    members can grow in knowledge and confidence.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Service &amp; solidarity</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Relief drives, newcomer support, and partnerships that turn
                    compassion into action in our cities.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-border/80 shadow-sm sm:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Open dialogue</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    We engage neighbours, institutions, and fellow citizens
                    with clarity, respect, and a spirit of shared humanity.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>

          <section className="mt-16 text-center sm:mt-20">
            <p className="text-muted-foreground">
              Want to collaborate, volunteer, or learn more?
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Contact us
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
