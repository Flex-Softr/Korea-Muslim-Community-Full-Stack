"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { useTranslatedFields } from "@/hooks/use-translated-fields";
import {
  deleteDashboardUser,
  getDashboardUserById,
  updateDashboardUser,
  type UserDetail,
} from "@/lib/api/dashboard-users";
import { useRouter } from "next/navigation";
import { useToastSystem } from "@/components/ui/toast-system";

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
        const data = await getDashboardUserById(id);
        if (!cancelled) setUser(data);
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

  const profileCopy = useTranslatedFields({
    locale: "en",
    description: user?.profile?.aboutSummary || user?.profile?.bio || "No profile bio/image found.",
  });

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
                {profileCopy.description}
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
                      <BlogTitle title={blog.title} />
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
                      try {
                        await updateDashboardUser(user.id, { role: "USER" });
                      } catch {
                        return notify("Could not remove admin role.", "error");
                      }
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
                      try {
                        await updateDashboardUser(user.id, { role: "ADMIN" });
                      } catch {
                        return notify("Could not make admin.", "error");
                      }
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
            try {
              await updateDashboardUser(user.id, { suspend: user.status !== "suspended" });
            } catch {
              return notify("Could not update user status.", "error");
            }
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
            try {
              await deleteDashboardUser(user.id);
            } catch {
              return notify("Could not delete user.", "error");
            }
            notify("User deleted.", "success");
            router.push("/dashboard/users");
          })();
        }}
      />
    </section>
  );
}

function BlogTitle({ title }: { title: string }) {
  const translated = useTranslatedFields({ locale: "en", title });
  return <p className="font-medium">{translated.title}</p>;
}
