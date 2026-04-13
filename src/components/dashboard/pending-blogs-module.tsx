"use client";

import { useEffect, useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/ui/page-header";
import { ReusablePagination } from "@/components/ui/reusable-pagination";
import { useToastSystem } from "@/components/ui/toast-system";

type PendingBlogRow = {
  id: string;
  title: string;
  authorName: string;
  authorEmail: string | null;
  dateIso: string;
};

const PAGE_SIZE = 10;

function formatDate(dateIso: string): string {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function PendingBlogsModule() {
  const { notify } = useToastSystem();
  const [rows, setRows] = useState<PendingBlogRow[]>([]);
  const [page, setPage] = useState(1);
  const [approveTarget, setApproveTarget] = useState<PendingBlogRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PendingBlogRow | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/blogs/pending", { cache: "no-store" });
      const data = (await res.json()) as { items?: PendingBlogRow[] };
      if (!res.ok) throw new Error("Failed");
      setRows(data.items ?? []);
    } catch {
      notify("Could not load pending blogs.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const offset = (safePage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(offset, offset + PAGE_SIZE);

  const columns: Array<DataTableColumn<PendingBlogRow>> = [
    { key: "title", header: "Title", render: (row) => row.title },
    {
      key: "author",
      header: "Author",
      render: (row) => (
        <div>
          <p className="font-medium">{row.authorName}</p>
          {row.authorEmail ? <p className="text-xs text-muted-foreground">{row.authorEmail}</p> : null}
        </div>
      ),
    },
    { key: "date", header: "Date", render: (row) => formatDate(row.dateIso) },
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
            title="Approve blog"
            className="hover:bg-emerald-600"
          >
            <Check className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            variant="destructive"
            onClick={() => setDeleteTarget(row)}
            title="Reject and delete blog"
            className="hover:bg-red-600"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-4">
      <PageHeader
        title="Pending Blogs"
        subtitle="Review blogs awaiting moderation approval."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Blogs", href: "/dashboard/content/blog/blogs" },
          { label: "Pending Blogs" },
        ]}
      />

      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        {loading ? (
          <LoadingSpinner label="Loading pending blogs..." />
        ) : (
          <DataTable
            rows={pageRows}
            columns={columns}
            getRowId={(row) => row.id}
            emptyLabel="No pending blogs."
          />
        )}

        {rows.length > 0 && totalPages > 1 ? (
          <div className="mt-6">
            <ReusablePagination currentPage={safePage} totalPages={totalPages} onChange={setPage} />
          </div>
        ) : null}
      </div>

      <ConfirmActionModal
        open={approveTarget != null}
        onOpenChange={(open) => !open && setApproveTarget(null)}
        title="Approve blog?"
        description={`This will publish "${approveTarget?.title ?? "this blog"}".`}
        confirmLabel="Approve"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (!approveTarget) return;
          void (async () => {
            const res = await fetch(`/api/dashboard/content/blog/${approveTarget.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "published" }),
            });
            if (!res.ok) return notify("Could not approve blog.", "error");
            setApproveTarget(null);
            notify("Blog approved and published.", "success");
            void load();
          })();
        }}
      />

      <ConfirmActionModal
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Reject and delete blog?"
        description={`This will permanently delete "${deleteTarget?.title ?? "this blog"}".`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          void (async () => {
            const res = await fetch(`/api/dashboard/content/blog/${deleteTarget.id}`, {
              method: "DELETE",
            });
            if (!res.ok) return notify("Could not delete blog.", "error");
            setDeleteTarget(null);
            notify("Pending blog rejected and deleted.", "success");
            void load();
          })();
        }}
      />
    </section>
  );
}
