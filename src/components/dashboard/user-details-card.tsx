"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { useRouter } from "next/navigation";
import { useToastSystem } from "@/components/ui/toast-system";

type UserDetail = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: "pending" | "active" | "suspended";
  createdAt: string;
  updatedAt: string;
  profile: {
    aboutSummary: string | null;
    bio: string | null;
    imageUrl: string | null;
  } | null;
  submittedBlogs: Array<{
    id: string;
    title: string;
    category: string;
    dateIso: string;
  }>;
};

function formatDate(dateIso: string): string {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleString();
}

export function UserDetailsCard({ id }: { id: string }) {
  const router = useRouter();
  const { notify } = useToastSystem();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/dashboard/users/${id}`, { cache: "no-store" });
        const data = (await res.json()) as UserDetail | { error: string };
        if (!res.ok) throw new Error("Failed");
        if (!cancelled) setUser(data as UserDetail);
      } catch {
        if (!cancelled) setError("Could not load user details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">User Details</h1>
        <Link href="/dashboard/users" className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}>
          Back to users
        </Link>
      </div>
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        {loading ? <p className="text-sm text-muted-foreground">Loading user...</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {user ? (
          <div className="space-y-6">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div><dt className="text-xs uppercase text-muted-foreground">Name</dt><dd>{user.name || "N/A"}</dd></div>
              <div><dt className="text-xs uppercase text-muted-foreground">Email</dt><dd>{user.email}</dd></div>
              <div><dt className="text-xs uppercase text-muted-foreground">Role</dt><dd>{user.role}</dd></div>
              <div><dt className="text-xs uppercase text-muted-foreground">Status</dt><dd>{user.status}</dd></div>
              <div><dt className="text-xs uppercase text-muted-foreground">Created At</dt><dd>{formatDate(user.createdAt)}</dd></div>
              <div><dt className="text-xs uppercase text-muted-foreground">Updated At</dt><dd>{formatDate(user.updatedAt)}</dd></div>
            </dl>

            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Profile info
              </h2>
              {user.profile?.imageUrl ? (
                <div className="mb-3">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border border-border">
                    <Image src={user.profile.imageUrl} alt="" fill className="object-cover" />
                  </div>
                </div>
              ) : null}
              <p className="text-sm text-muted-foreground">
                {user.profile?.aboutSummary || user.profile?.bio || "No profile bio/image found."}
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Submitted blogs
              </h2>
              {user.submittedBlogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No submitted blogs.</p>
              ) : (
                <ul className="space-y-2">
                  {user.submittedBlogs.map((blog) => (
                    <li key={blog.id} className="rounded-md border border-border/70 px-3 py-2">
                      <p className="font-medium">{blog.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {blog.category} · {formatDate(blog.dateIso)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {user.role === "ADMIN" ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void (async () => {
                      const res = await fetch(`/api/dashboard/users/${user.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ role: "USER" }),
                      });
                      if (!res.ok) return notify("Could not remove admin role.", "error");
                      notify("Admin role removed.", "success");
                      router.refresh();
                    })();
                  }}
                >
                  Remove Admin
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void (async () => {
                      const res = await fetch(`/api/dashboard/users/${user.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ role: "ADMIN" }),
                      });
                      if (!res.ok) return notify("Could not make admin.", "error");
                      notify("User promoted to admin.", "success");
                      router.refresh();
                    })();
                  }}
                >
                  Make Admin
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setConfirmSuspend(true)}>
                {user.status === "suspended" ? "Activate User" : "Suspend User"}
              </Button>
              <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)}>
                Delete User
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <ConfirmActionModal
        open={confirmSuspend}
        onOpenChange={setConfirmSuspend}
        title={user?.status === "suspended" ? "Activate user?" : "Suspend user?"}
        description={
          user?.status === "suspended"
            ? `This will activate ${user?.email ?? "this user"}.`
            : `This will suspend ${user?.email ?? "this user"}.`
        }
        confirmLabel={user?.status === "suspended" ? "Activate" : "Suspend"}
        cancelLabel="Cancel"
        onConfirm={() => {
          if (!user) return;
          void (async () => {
            const res = await fetch(`/api/dashboard/users/${user.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ suspend: user.status !== "suspended" }),
            });
            if (!res.ok) return notify("Could not update user status.", "error");
            notify(user.status === "suspended" ? "User activated." : "User suspended.", "success");
            setConfirmSuspend(false);
            router.refresh();
          })();
        }}
      />

      <ConfirmActionModal
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete user?"
        description={`This will permanently delete ${user?.email ?? "this user"}.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="destructive"
        onConfirm={() => {
          if (!user) return;
          void (async () => {
            const res = await fetch(`/api/dashboard/users/${user.id}`, { method: "DELETE" });
            if (!res.ok) return notify("Could not delete user.", "error");
            notify("User deleted.", "success");
            router.push("/dashboard/users");
          })();
        }}
      />
    </section>
  );
}
