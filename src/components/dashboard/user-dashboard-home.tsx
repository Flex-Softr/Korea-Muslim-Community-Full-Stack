"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAccountProfile } from "@/lib/api/account-profile";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToastSystem } from "@/components/ui/toast-system";

type BlogItem = {
  id: string;
  title: string;
  category: string;
  dateIso: string;
  status?: "pending" | "published";
};

function formatDate(dateIso: string): string {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function UserDashboardHome() {
  const { notify } = useToastSystem();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [memberCode, setMemberCode] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [profile, blogRes] = await Promise.all([
          getAccountProfile(),
          fetch("/api/dashboard/content/blog?mine=true", { cache: "no-store" }),
        ]);
        if (!blogRes.ok) throw new Error("Failed blogs");
        const blogData = (await blogRes.json()) as { items?: BlogItem[] };
        if (cancelled) return;
        setName(profile.user.name ?? "");
        setEmail(profile.user.email);
        setMemberCode(profile.member?.memberCode ?? null);
        setCity(profile.member?.cityKorea ?? null);
        setBlogs(blogData.items ?? []);
      } catch {
        if (!cancelled) notify("Could not load dashboard data.", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [notify]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              View a quick profile summary. Edit your full registration details in{" "}
              <Link href="/dashboard/settings#account-profile" className="font-medium text-primary underline-offset-4 hover:underline">
                Settings
              </Link>
              .
            </p>
          </div>
          <Link
            href="/dashboard/blogs/create"
            className={buttonVariants({ variant: "default", size: "default", className: "w-full sm:w-auto" })}
          >
            Write Blog
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading profile…</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} readOnly className="bg-muted" />
            </div>
            {memberCode ? (
              <div className="space-y-2">
                <Label>Member code</Label>
                <Input value={memberCode} readOnly className="bg-muted" />
              </div>
            ) : null}
            {city ? (
              <div className="space-y-2">
                <Label>City (Korea)</Label>
                <Input value={city} readOnly className="bg-muted" />
              </div>
            ) : null}
            <div className="pt-1">
              <Link
                href="/dashboard/settings#account-profile"
                className={buttonVariants({ variant: "secondary" })}
              >
                Edit full profile in Settings
              </Link>
            </div>
          </div>
        )}
      </section>

      <section id="my-blogs" className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">My Blogs</h2>
        {blogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">You have not created any blogs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm sm:min-w-[40rem]">
              <thead>
                <tr className="border-b border-border/80 bg-muted/70 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2">Title</th>
                  <th className="px-2 py-2">Category</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog, idx) => (
                  <tr
                    key={blog.id}
                    className={
                      idx % 2 === 0
                        ? "border-b border-border/60 bg-background text-foreground transition-colors duration-200 hover:bg-muted/60"
                        : "border-b border-border/60 bg-muted/30 text-foreground transition-colors duration-200 hover:bg-muted/60"
                    }
                  >
                    <td className="px-2 py-2 font-medium">{blog.title}</td>
                    <td className="px-2 py-2">{blog.category}</td>
                    <td className="px-2 py-2">
                      <span
                        className={
                          blog.status === "pending"
                            ? "inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800"
                            : "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800"
                        }
                      >
                        {blog.status ?? "published"}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-muted-foreground">{formatDate(blog.dateIso)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
