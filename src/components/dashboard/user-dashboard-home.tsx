"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToastSystem } from "@/components/ui/toast-system";

type ProfilePayload = {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    bio: string | null;
    imageUrl: string | null;
  };
};

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
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [profileRes, blogRes] = await Promise.all([
          fetch("/api/account/profile", { cache: "no-store" }),
          fetch("/api/dashboard/content/blog?mine=true", { cache: "no-store" }),
        ]);
        if (!profileRes.ok || !blogRes.ok) throw new Error("Failed");
        const profile = (await profileRes.json()) as ProfilePayload;
        const blogData = (await blogRes.json()) as { items?: BlogItem[] };
        if (cancelled) return;
        setName(profile.user.name ?? "");
        setEmail(profile.user.email);
        setBio(profile.user.bio ?? "");
        setImageUrl(profile.user.imageUrl ?? null);
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

  const saveProfile = () => {
    void (async () => {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim(),
          imageUrl,
        }),
      });
      if (!res.ok) {
        notify("Could not update profile.", "error");
        return;
      }
      notify("Profile updated.", "success");
    })();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your profile and your blogs.</p>
          </div>
          <Link
            href="/dashboard/blogs/create"
            className={buttonVariants({ variant: "default", size: "default", className: "w-full sm:w-auto" })}
          >
            Write Blog
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-bio">Bio</Label>
              <textarea
                id="profile-bio"
                className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={3000}
              />
            </div>
            <div className="space-y-2">
              <Label>Profile image</Label>
              <ImageUploader
                value={imageUrl}
                onChange={setImageUrl}
                maxSizeMb={5}
                helperText="Upload your profile image."
              />
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={saveProfile}>
                Save Profile
              </Button>
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
                <tr className="border-b border-border bg-gray-100 text-left text-xs font-bold uppercase tracking-wide text-foreground">
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
                        ? "border-b border-border/60 bg-white transition-colors duration-200 hover:bg-indigo-50"
                        : "border-b border-border/60 bg-slate-50/70 transition-colors duration-200 hover:bg-indigo-50"
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
