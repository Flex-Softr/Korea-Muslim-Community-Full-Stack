"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Ban, Eye, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/ui/page-header";
import { ReusablePagination } from "@/components/ui/reusable-pagination";
import { useToastSystem } from "@/components/ui/toast-system";
import { emitPendingUsersChanged } from "@/lib/dashboard-events";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: "pending" | "active" | "suspended";
  createdAt: string;
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

function StatusBadge({ status }: { status: UserRow["status"] }) {
  const tone =
    status === "pending"
      ? "bg-amber-100 text-amber-800"
      : status === "active"
        ? "bg-emerald-100 text-emerald-800"
        : "bg-red-100 text-red-800";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}>{status}</span>;
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
      const res = await fetch(`/api/dashboard/users?${params.toString()}`, { cache: "no-store" });
      const data = (await res.json()) as UsersResponse;
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
    const res = await fetch(`/api/dashboard/users/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    if (!res.ok) return notify("Could not update user role.", "error");
    notify(nextRole === "ADMIN" ? "User promoted to admin." : "Admin role removed.", "success");
    void load();
  };

  const suspendToggle = async (row: UserRow) => {
    const suspend = row.status !== "suspended";
    const res = await fetch(`/api/dashboard/users/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suspend }),
    });
    if (!res.ok) return notify("Could not update user status.", "error");
    notify(suspend ? "User suspended." : "User activated.", "success");
    void load();
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
          <DataTable rows={rows} columns={columns} getRowId={(row) => row.id} emptyLabel="No users found." />
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
            const res = await fetch(`/api/dashboard/users/${deleteTarget.id}`, { method: "DELETE" });
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
