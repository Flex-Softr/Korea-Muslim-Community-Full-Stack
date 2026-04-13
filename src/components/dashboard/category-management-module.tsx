"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToastSystem } from "@/components/ui/toast-system";

type CategoryType = "blog" | "activity" | "photo" | "video";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function CategoryManagementModule({
  type,
  title,
}: {
  type: CategoryType;
  title: string;
}) {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);
  const { notify } = useToastSystem();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/dashboard/categories?type=${type}`, { cache: "no-store" });
        const data = (await res.json()) as { items?: CategoryRow[] };
        if (!res.ok || cancelled) return;
        setCategories(data.items ?? []);
      } catch {
        if (!cancelled) notify("Could not load categories.", "error");
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [notify, type]);

  const editingRow = useMemo(
    () => categories.find((c) => c.id === editingId) ?? null,
    [categories, editingId],
  );

  const resetForm = () => {
    setName("");
    setEditingId(null);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      notify("Category name is required.", "warning");
      return;
    }

    const slug = slugify(trimmed);
    if (!slug) {
      notify("Category name must contain letters or numbers.", "warning");
      return;
    }

    const duplicate = categories.find(
      (c) => c.slug === slug && c.id !== editingId,
    );
    if (duplicate) {
      notify("Category with same slug already exists.", "error");
      return;
    }

    if (editingId) {
      void (async () => {
        const res = await fetch(`/api/dashboard/categories/${type}/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        });
        if (!res.ok) {
          notify("Could not update category.", "error");
          return;
        }
        const updated = (await res.json()) as CategoryRow;
        setCategories((cur) => cur.map((c) => (c.id === editingId ? updated : c)));
        notify("Category updated.", "success");
        resetForm();
      })();
      return;
    }

    void (async () => {
      const res = await fetch("/api/dashboard/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, name: trimmed }),
      });
      if (!res.ok) {
        notify("Could not add category.", "error");
        return;
      }
      const created = (await res.json()) as CategoryRow;
      setCategories((cur) => [created, ...cur]);
      notify("Category added.", "success");
      resetForm();
    })();
  };

  const startEdit = (row: CategoryRow) => {
    setEditingId(row.id);
    setName(row.name);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    void (async () => {
      const res = await fetch(`/api/dashboard/categories/${type}/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        notify("Could not delete category.", "error");
        return;
      }
      setCategories((cur) => cur.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
      if (editingId === deleteTarget.id) {
        resetForm();
      }
      notify("Category deleted.", "success");
    })();
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Add, edit, and delete categories. Slug is generated automatically.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm lg:col-span-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {editingRow ? "Edit category" : "Add category"}
          </h2>
          <form className="mt-4 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor={`${type}-category-name`}>Name</Label>
              <Input
                id={`${type}-category-name`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter category name"
                maxLength={80}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit">{editingRow ? "Update" : "Add"}</Button>
              {editingRow ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm lg:col-span-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Categories
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[30rem] text-sm sm:min-w-[36rem]">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Type</th>
                  <th className="px-2 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-2 py-8 text-center text-muted-foreground">
                      No categories yet.
                    </td>
                  </tr>
                ) : (
                  categories.map((row) => (
                    <tr key={row.id} className="border-b border-border/60">
                      <td className="px-2 py-2 font-medium">{row.name}</td>
                      <td className="px-2 py-2 uppercase text-muted-foreground">{row.type}</td>
                      <td className="px-2 py-2">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => startEdit(row)}>
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteTarget(row)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmActionModal
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete category?"
        description={`This will permanently delete ${deleteTarget?.name ?? "this category"}.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        confirmVariant="destructive"
      />
    </section>
  );
}
