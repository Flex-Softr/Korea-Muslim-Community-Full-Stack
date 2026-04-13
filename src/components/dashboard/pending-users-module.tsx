"use client";

import { useEffect, useMemo, useState } from "react";
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

export function PendingUsersModule() {
  const { notify } = useToastSystem();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [approveTarget, setApproveTarget] = useState<UserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: "pending",
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/dashboard/users?${params.toString()}`, { cache: "no-store" });
      const data = (await res.json()) as UsersResponse;
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
            const res = await fetch(`/api/dashboard/users/${approveTarget.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ approve: true }),
            });
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
            const res = await fetch(`/api/dashboard/users/${deleteTarget.id}`, { method: "DELETE" });
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
