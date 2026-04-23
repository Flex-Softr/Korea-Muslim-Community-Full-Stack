"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const PAGE_SIZE = 10;

function formatDate(dateIso: string): string {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
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

export function PendingUsersModule() {
  const { notify } = useToastSystem();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [approveTarget, setApproveTarget] = useState<UserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [userDetails, setUserDetails] = useState<Record<string, UserDetail>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: "pending",
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (search.trim()) params.set("search", search.trim());
      const res = await fetchDashboardUsers(params);
      const data = await parseJson<UsersResponse>(res);
      if (!res.ok) throw new Error("Failed");
      setRows(data.items ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch {
      notify("Could not load pending users.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const applySearch = () => {
    setPage(1);
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
        render: () => (
          <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
            pending
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
            <Button
              type="button"
              size="icon-sm"
              onClick={() => setApproveTarget(row)}
              title="Approve user"
              className="hover:bg-emerald-600"
            >
              <Check className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="destructive"
              onClick={() => setDeleteTarget(row)}
              title="Reject and delete user"
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
        title="Pending Users"
        subtitle="Review and approve pending user registrations."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Users", href: "/dashboard/users" },
          { label: "Pending Users" },
        ]}
      />

      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="mb-4 flex gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email"
          />
          <Button type="button" onClick={applySearch}>
            Search
          </Button>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading pending users..." />
        ) : (
          <DataTable
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            emptyLabel="No pending users found."
            expandButtonLabel="Toggle pending user details"
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
        open={approveTarget != null}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        title="Approve user?"
        description={`This will approve ${approveTarget?.email ?? "this user"} and set status to active.`}
        confirmLabel="Approve"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (!approveTarget) return;
          void (async () => {
            const res = await patchDashboardUser(approveTarget.id, { approve: true });
            if (!res.ok) return notify("Could not approve user.", "error");
            setApproveTarget(null);
            notify("User approved.", "success");
            emitPendingUsersChanged();
            void load();
          })();
        }}
      />

      <ConfirmActionModal
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Reject and delete user?"
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
            notify("Pending user deleted.", "success");
            emitPendingUsersChanged();
            void load();
          })();
        }}
      />
    </section>
  );
}
