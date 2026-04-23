"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Ban, Eye, ShieldCheck, ShieldOff, Trash2, UserPlus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/ui/page-header";
import { ReusablePagination } from "@/components/ui/reusable-pagination";
import { useToastSystem } from "@/components/ui/toast-system";
import { emitPendingUsersChanged } from "@/lib/dashboard-events";
import {
  deleteDashboardUser,
  fetchDashboardUserById,
  fetchDashboardUsers,
  parseJson,
  patchDashboardUser,
} from "@/lib/services/dashboard-users";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: "pending" | "active" | "suspended";
  isMember: boolean;
  createdAt: string;
};

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
    category: string | null;
    dateIso: string;
  }>;
};

type UsersResponse = {
  items: UserRow[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

type MemberCategory = "EXECUTIVE" | "ADVISOR_BODY" | "GENERAL";

const PAGE_SIZE = 10;

function formatDate(dateIso: string): string {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function StatusBadge({ status }: { status: UserRow["status"] }) {
  const tone =
    status === "pending"
      ? "bg-amber-100 text-amber-800"
      : status === "active"
        ? "bg-emerald-100 text-emerald-800"
        : "bg-red-100 text-red-800";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}>{status}</span>;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

function DetailImage({ label, src }: { label: string; src: string | null | undefined }) {
  return (
    <div className="space-y-1 md:col-span-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {src ? (
        <div className="relative h-32 w-32 overflow-hidden rounded-lg border border-border">
          <Image src={src} alt="Profile" fill className="object-cover" />
        </div>
      ) : (
        <p className="text-sm text-foreground">N/A</p>
      )}
    </div>
  );
}

export function UsersModule() {
  const { notify } = useToastSystem();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<UserRow | null>(null);
  const [convertTarget, setConvertTarget] = useState<UserRow | null>(null);
  const [convertRole, setConvertRole] = useState<MemberCategory>("GENERAL");
  const [userDetails, setUserDetails] = useState<Record<string, UserDetail>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (search.trim()) params.set("search", search.trim());
      if (role) params.set("role", role);
      if (status) params.set("status", status);
      const res = await fetchDashboardUsers(params);
      const data = await parseJson<UsersResponse>(res);
      if (!res.ok) throw new Error("Failed");
      setRows(data.items ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch {
      notify("Could not load users.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, role, status]);

  const applySearch = () => {
    setPage(1);
    void load();
  };

  const updateRole = async (row: UserRow, nextRole: "USER" | "ADMIN") => {
    const res = await patchDashboardUser(row.id, { role: nextRole });
    if (!res.ok) return notify("Could not update user role.", "error");
    notify(nextRole === "ADMIN" ? "User promoted to admin." : "Admin role removed.", "success");
    void load();
  };

  const suspendToggle = async (row: UserRow) => {
    const suspend = row.status !== "suspended";
    const res = await patchDashboardUser(row.id, { suspend });
    if (!res.ok) return notify("Could not update user status.", "error");
    notify(suspend ? "User suspended." : "User activated.", "success");
    void load();
  };

  const convertToMember = async (row: UserRow, role: MemberCategory) => {
    const res = await patchDashboardUser(row.id, {
      convertToMember: true,
      convertToMemberRole: role,
    });
    const body = await parseJson<{ error?: string }>(res);
    if (!res.ok) return notify(body.error ?? "Could not convert user to member.", "error");
    notify("User converted to member successfully.", "success");
    void load();
  };

  const loadUserDetails = async (userId: string) => {
    if (userDetails[userId] || loadingDetails[userId]) return;
    setLoadingDetails((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await fetchDashboardUserById(userId);
      const data = await parseJson<UserDetail | { error?: string }>(res);
      if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed");
      setUserDetails((prev) => ({ ...prev, [userId]: data as UserDetail }));
    } catch {
      notify("Could not load full user details.", "error");
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const columns = useMemo<Array<DataTableColumn<UserRow>>>(() => {
    return [
      {
        key: "name",
        header: "Name",
        render: (row) => row.name || "N/A",
      },
      {
        key: "email",
        header: "Email",
        render: (row) => row.email,
      },
      {
        key: "role",
        header: "Role",
        render: (row) => (row.role === "ADMIN" ? "admin" : "user"),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: "member",
        header: "Member",
        render: (row) =>
          row.isMember ? (
            <span className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800">
              Yes
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              No
            </span>
          ),
      },
      {
        key: "createdAt",
        header: "Created At",
        render: (row) => formatDate(row.createdAt),
      },
      {
        key: "actions",
        header: "Actions",
        headerClassName: "text-right",
        cellClassName: "text-right",
        render: (row) => (
          <div className="flex justify-end gap-2">
            <Link
              href={`/dashboard/users/${row.id}`}
              className={buttonVariants({ variant: "outline", size: "icon-sm" })}
              title="View user"
            >
              <Eye className="size-4" />
            </Link>
            {row.role === "ADMIN" ? (
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                onClick={() => void updateRole(row, "USER")}
                title="Remove admin"
                className="hover:bg-amber-50 hover:text-amber-700"
              >
                <ShieldOff className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                onClick={() => void updateRole(row, "ADMIN")}
                title="Make admin"
                className="hover:bg-emerald-50 hover:text-emerald-700"
              >
                <ShieldCheck className="size-4" />
              </Button>
            )}
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={() => setSuspendTarget(row)}
              title={row.status === "suspended" ? "Activate user" : "Suspend user"}
              className="hover:bg-red-50 hover:text-red-700"
            >
              <Ban className="size-4" />
            </Button>
            {!row.isMember ? (
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                onClick={() => {
                  setConvertTarget(row);
                  setConvertRole("GENERAL");
                }}
                title="Convert to member"
                className="hover:bg-muted hover:text-foreground"
              >
                <UserPlus className="size-4" />
              </Button>
            ) : null}
            <Button
              type="button"
              size="icon-sm"
              variant="destructive"
              onClick={() => setDeleteTarget(row)}
              title="Delete user"
              className="hover:bg-red-600"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      },
    ];
  }, []);

  return (
    <section className="space-y-4">
      <PageHeader
        title="Users"
        subtitle="Manage users, roles, and status."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Users" },
        ]}
        action={
          <Link href="/dashboard/users/pending" className={buttonVariants({ variant: "outline", size: "default" })}>
            View Pending Users
          </Link>
        }
      />

      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email"
          />
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All roles</option>
            <option value="USER">user</option>
            <option value="ADMIN">admin</option>
          </select>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All status</option>
            <option value="pending">pending</option>
            <option value="active">active</option>
            <option value="suspended">suspended</option>
          </select>
          <Button type="button" onClick={applySearch}>
            Search
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading users..." />
        ) : (
          <DataTable
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            emptyLabel="No users found."
            expandButtonLabel="Toggle user details"
            onExpandedChange={(row, expanded) => {
              if (expanded) {
                void loadUserDetails(row.id);
              }
            }}
            renderExpandedRow={(row) => (
              loadingDetails[row.id] ? (
                <p className="text-sm text-muted-foreground">Loading full details...</p>
              ) : userDetails[row.id] ? (
                <div className="grid gap-3 md:grid-cols-3">
                  <DetailItem label="User ID" value={userDetails[row.id].id} />
                  <DetailItem label="Full Name" value={userDetails[row.id].name || "N/A"} />
                  <DetailItem label="Email" value={userDetails[row.id].email} />
                  <DetailItem
                    label="Role"
                    value={userDetails[row.id].role === "ADMIN" ? "admin" : "user"}
                  />
                  <DetailItem label="Status" value={userDetails[row.id].status} />
                  <DetailItem label="Member Account" value={row.isMember ? "Yes" : "No"} />
                  <DetailItem label="Created At" value={formatDate(userDetails[row.id].createdAt)} />
                  <DetailItem label="Updated At" value={formatDate(userDetails[row.id].updatedAt)} />
                  <DetailItem
                    label="About Summary"
                    value={userDetails[row.id].profile?.aboutSummary || "N/A"}
                  />
                  <DetailItem label="Bio" value={userDetails[row.id].profile?.bio || "N/A"} />
                  <DetailImage label="Profile Image" src={userDetails[row.id].profile?.imageUrl} />
                  <DetailItem
                    label="Submitted Blogs"
                    value={String(userDetails[row.id].submittedBlogs.length)}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No detail data found.</p>
              )
            )}
          />
        )}

        {totalPages > 1 ? (
          <div className="mt-6">
            <ReusablePagination currentPage={page} totalPages={totalPages} onChange={setPage} />
          </div>
        ) : null}
      </div>

      <ConfirmActionModal
        open={suspendTarget != null}
        onOpenChange={(open) => !open && setSuspendTarget(null)}
        title={suspendTarget?.status === "suspended" ? "Activate user?" : "Suspend user?"}
        description={
          suspendTarget?.status === "suspended"
            ? `This will activate ${suspendTarget?.email ?? "this user"}.`
            : `This will suspend ${suspendTarget?.email ?? "this user"}.`
        }
        confirmLabel={suspendTarget?.status === "suspended" ? "Activate" : "Suspend"}
        cancelLabel="Cancel"
        onConfirm={() => {
          if (!suspendTarget) return;
          void suspendToggle(suspendTarget);
          setSuspendTarget(null);
        }}
      />

      <ConfirmActionModal
        open={convertTarget != null}
        onOpenChange={(open) => {
          if (!open) {
            setConvertTarget(null);
            setConvertRole("GENERAL");
          }
        }}
        title="Convert user to member?"
        description={`This will create a member profile from ${convertTarget?.email ?? "this user"}.`}
        confirmLabel="Convert"
        cancelLabel="Cancel"
        confirmVariant="default"
        onConfirm={() => {
          if (!convertTarget) return;
          void convertToMember(convertTarget, convertRole);
          setConvertTarget(null);
          setConvertRole("GENERAL");
        }}
      >
        <div className="space-y-2">
          <label htmlFor="convert-member-role" className="text-sm font-medium text-foreground">
            Assign member role
          </label>
          <select
            id="convert-member-role"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={convertRole}
            onChange={(e) => setConvertRole(e.target.value as MemberCategory)}
          >
            <option value="EXECUTIVE">Executive Member</option>
            <option value="ADVISOR_BODY">Advisor Body</option>
            <option value="GENERAL">General Member</option>
          </select>
        </div>
      </ConfirmActionModal>

      <ConfirmActionModal
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete user?"
        description={`This will permanently delete ${deleteTarget?.email ?? "this user"}.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          void (async () => {
            const res = await deleteDashboardUser(deleteTarget.id);
            if (!res.ok) return notify("Could not delete user.", "error");
            setDeleteTarget(null);
            notify("User deleted.", "success");
            emitPendingUsersChanged();
            void load();
          })();
        }}
      />
    </section>
  );
}
