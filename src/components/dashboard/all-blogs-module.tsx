"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { ReusablePagination } from "@/components/ui/reusable-pagination";
import { useToastSystem } from "@/components/ui/toast-system";

const PAGE_SIZE = 8;

type EditableRow = {
  id: string;
  title: string;
  category: string;
  dateIso: string;
  description: string;
  coverImage: string;
  createdById?: string;
};

function formatDate(dateIso: string): string {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

type ContentModuleProps = {
  contentType: "blog" | "activity";
  title: string;
  subtitle: string;
  nounSingular: string;
  nounPlural: string;
  paginationAriaLabel: string;
  enableCreate?: boolean;
  createHref?: string;
  editHrefBase?: string;
};

function ContentRowsModule({
  contentType,
  title,
  subtitle,
  nounSingular,
  nounPlural,
  paginationAriaLabel,
  enableCreate = false,
  createHref,
  editHrefBase,
}: ContentModuleProps) {
  const [items, setItems] = useState<EditableRow[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [editTarget, setEditTarget] = useState<EditableRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EditableRow | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [canManageAll, setCanManageAll] = useState(false);
  const { notify } = useToastSystem();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard/content/${contentType}`, { cache: "no-store" });
        const data = (await res.json()) as {
          items?: EditableRow[];
          currentUserId?: string | null;
          canManageAll?: boolean;
        };
        if (!res.ok) throw new Error("Failed");
        if (cancelled) return;
        const rows = data.items ?? [];
        setItems(rows);
        setCurrentUserId(data.currentUserId ?? null);
        setCanManageAll(data.canManageAll ?? false);
        setCategories(
          [...new Set(rows.map((row) => row.category))].sort((a, b) => a.localeCompare(b)),
        );
      } catch {
        if (!cancelled) {
          notify(`Could not load ${nounPlural.toLowerCase()}.`, "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [contentType, nounPlural, notify]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const offset = (safePage - 1) * PAGE_SIZE;
  const pageRows = items.slice(offset, offset + PAGE_SIZE);

  const openEdit = (row: EditableRow) => {
    setEditTarget(row);
    setEditTitle(row.title);
    setEditCategory(row.category);
  };

  const canManageRow = (row: EditableRow) => canManageAll || (currentUserId != null && row.createdById === currentUserId);

  const saveEdit = () => {
    if (!editTarget) return;
    const title = editTitle.trim();
    const category = editCategory.trim();
    if (!title || !category) {
      notify("Title and category are required.", "warning");
      return;
    }
    void (async () => {
      const res = await fetch(`/api/dashboard/content/${contentType}/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category }),
      });
      if (!res.ok) {
        notify(`Could not update ${nounSingular.toLowerCase()}.`, "error");
        return;
      }
      const updated = (await res.json()) as EditableRow;
      setItems((cur) => cur.map((row) => (row.id === editTarget.id ? updated : row)));
      setEditTarget(null);
      notify(`${nounSingular} updated.`, "success");
    })();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    void (async () => {
      const res = await fetch(`/api/dashboard/content/${contentType}/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        notify(`Could not delete ${nounSingular.toLowerCase()}.`, "error");
        return;
      }
      setItems((cur) => cur.filter((row) => row.id !== deleteTarget.id));
      setDeleteTarget(null);
      notify(`${nounSingular} deleted.`, "success");
    })();
  };

  useEffect(() => {
    if (safePage !== page) setPage(safePage);
  }, [page, safePage]);

  return (
    <section className="space-y-4">
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Content" },
          { label: nounPlural },
        ]}
        action={
          enableCreate ? (
            createHref ? (
              <Link href={createHref} className={buttonVariants({ variant: "default", size: "default" })}>
                Add {nounSingular}
              </Link>
            ) : (
              <Button type="button" disabled>
                Add {nounSingular}
              </Button>
            )
          ) : null
        }
      />

      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-muted/70 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2">Title</th>
                <th className="px-2 py-2">Category</th>
                <th className="px-2 py-2">Created At</th>
                <th className="px-2 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-2 py-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-8 text-center text-muted-foreground">
                    No {nounPlural.toLowerCase()} found.
                  </td>
                </tr>
              ) : (
                pageRows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={
                      idx % 2 === 0
                        ? "border-b border-border/60 bg-background text-foreground transition-colors duration-200 hover:bg-muted/60"
                        : "border-b border-border/60 bg-muted/30 text-foreground transition-colors duration-200 hover:bg-muted/60"
                    }
                  >
                    <td className="px-2 py-2 font-medium">{row.title}</td>
                    <td className="px-2 py-2">{row.category}</td>
                    <td className="px-2 py-2 text-muted-foreground">{formatDate(row.dateIso)}</td>
                    <td className="px-2 py-2">
                      <div className="flex justify-end gap-2">
                        {editHrefBase ? (
                          canManageRow(row) ? (
                            <Link
                              href={`${editHrefBase}/${row.id}/edit`}
                              className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                              title={`Edit ${nounSingular.toLowerCase()}`}
                            >
                              <Pencil className="size-4" />
                            </Link>
                          ) : (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              disabled
                              title={`Only the creator can edit this ${nounSingular.toLowerCase()}`}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          )
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() => openEdit(row)}
                            disabled={!canManageRow(row)}
                            title={`Edit ${nounSingular.toLowerCase()}`}
                            className="hover:bg-muted hover:text-foreground"
                          >
                            <Pencil className="size-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          onClick={() => setDeleteTarget(row)}
                          disabled={!canManageRow(row)}
                          title={`Delete ${nounSingular.toLowerCase()}`}
                          className="hover:bg-red-600"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {items.length > 0 && totalPages > 1 ? (
          <div className="mt-6 space-y-2">
            <p className="text-xs text-muted-foreground">
              {paginationAriaLabel} - Page {safePage} of {totalPages}
            </p>
            <ReusablePagination
              currentPage={safePage}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
        ) : null}
      </div>

      <Dialog open={editTarget != null} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-lg">
          <div className="space-y-4 p-5">
            <DialogTitle>Edit {nounSingular.toLowerCase()}</DialogTitle>
            <DialogDescription>Update title or category.</DialogDescription>
            <div className="space-y-2">
              <Label htmlFor="edit-blog-title">Title</Label>
              <Input
                id="edit-blog-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={180}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-blog-category">Category</Label>
              <Input
                id="edit-blog-category"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                maxLength={80}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>
                Cancel
              </Button>
              <Button type="button" onClick={saveEdit}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmActionModal
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete ${nounSingular.toLowerCase()}?`}
        description={`This will permanently delete ${deleteTarget?.title ?? `this ${nounSingular.toLowerCase()}`}.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        confirmVariant="destructive"
      />
    </section>
  );
}

export function AllBlogsModule() {
  return (
    <ContentRowsModule
      contentType="blog"
      title="All Blogs"
      subtitle="Manage blog records from one place."
      nounSingular="Blog"
      nounPlural="Blogs"
      paginationAriaLabel="All blogs pagination"
      enableCreate
      createHref="/dashboard/content/blog/blogs/add"
      editHrefBase="/dashboard/content/blog/blogs"
    />
  );
}

export function AllActivitiesModule() {
  return (
    <ContentRowsModule
      contentType="activity"
      title="All Activities"
      subtitle="Manage activity records from one place."
      nounSingular="Activity"
      nounPlural="Activities"
      paginationAriaLabel="All activities pagination"
      enableCreate
      createHref="/dashboard/content/activity/activities/add"
      editHrefBase="/dashboard/content/activity/activities"
    />
  );
}
