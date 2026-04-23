import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageBanner } from "@/components/layout/page-banner";
import { Badge } from "@/components/ui/badge";
import { listDashboardContentByCreator } from "@/lib/dashboard/store";
import { getMemberById } from "@/lib/members/queries";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

function roleLabel(category: string): "Advisor" | "Executive" | "General" {
  if (category === "ADVISOR_BODY") return "Advisor";
  if (category === "EXECUTIVE") return "Executive";
  return "General";
}

function blogSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatDate(dateIso: string): string {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const member = await getMemberById(id);
  if (!member) return { title: "Member" };
  return {
    title: `${member.name} · Member profile`,
    description:
      member.aboutSummary ??
      member.bio ??
      member.designation ??
      member.title ??
      member.name,
  };
}

export default async function MembersProfilePage({ params }: PageProps) {
  const { id } = await params;
  const member = await getMemberById(id);
  if (!member) notFound();

  let blogs: Array<{ id: string; title: string; category: string; dateIso: string; slug: string }> = [];
  if (member.contactEmail?.trim()) {
    const user = await prisma.user.findUnique({
      where: { email: member.contactEmail.trim().toLowerCase() },
      select: { id: true },
    });
    if (user) {
      blogs = (await listDashboardContentByCreator("blog", user.id))
        .filter((blog) => blog.status === "published")
        .map((blog) => ({
          id: blog.id,
          title: blog.title,
          category: blog.category,
          dateIso: blog.dateIso,
          slug: blogSlug(blog.title),
        }));
    }
  }

  return (
    <>
      <PageBanner
        title={member.name}
        subtitle={member.designation ?? `${roleLabel(member.category)} member`}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Members", href: "/member" },
          { label: member.name },
        ]}
      />

      <section className="border-b border-border/40 bg-muted/10 py-10 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Link
            href="/member"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#2c7bb6] transition-colors hover:text-[#256fa3] dark:text-sky-400 dark:hover:text-sky-300"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to members
          </Link>

          <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                {member.imageUrl ? (
                  <Image src={member.imageUrl} alt="" fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">{member.name}</h1>
                  <Badge variant="secondary">{roleLabel(member.category)}</Badge>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {member.bio || member.aboutSummary || "No bio available."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">Blogs by this member</h2>
            {blogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No published blogs found for this member.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog) => (
                  <Link
                    key={blog.id}
                    href={`/blogs/${blog.slug}`}
                    className="rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-colors hover:bg-muted/30"
                  >
                    <p className="line-clamp-2 font-semibold">{blog.title}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {blog.category} · {formatDate(blog.dateIso)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
