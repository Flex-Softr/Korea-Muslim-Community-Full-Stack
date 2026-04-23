"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { useToastSystem } from "@/components/ui/toast-system";

type CarouselRow = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel?: string;
  ctaHref?: string;
  isActive: boolean;
  sortOrder: number;
};

function emptyForm() {
  return {
    title: "",
    subtitle: "",
    imageUrl: null as string | null,
    ctaLabel: "",
    ctaHref: "",
    isActive: true,
    sortOrder: 1,
  };
}

export function CarosalModule() {
  const { notify } = useToastSystem();
  const [rows, setRows] = useState<CarouselRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CarouselRow | null>(null);
  const [form, setForm] = useState(emptyForm);

  const editing = useMemo(
    () => rows.find((row) => row.id === editingId) ?? null,
    [editingId, rows],
  );

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/carosal", { cache: "no-store" });
      const data = (await res.json()) as { items?: CarouselRow[] };
      if (!res.ok) throw new Error("Failed");
      setRows(data.items ?? []);
    } catch {
      notify("Could not load carousel slides.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const startEdit = (row: CarouselRow) => {
    setEditingId(row.id);
    setForm({
      title: row.title,
      subtitle: row.subtitle,
      imageUrl: row.imageUrl,
      ctaLabel: row.ctaLabel ?? "",
      ctaHref: row.ctaHref ?? "",
      isActive: row.isActive,
      sortOrder: row.sortOrder,
    });
  };

  const save = async () => {
    if (!form.title.trim() || !form.subtitle.trim() || !form.imageUrl) {
      notify("Title, subtitle and image are required.", "warning");
      return;
    }

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      imageUrl: form.imageUrl,
      ctaLabel: form.ctaLabel.trim() || undefined,
      ctaHref: form.ctaHref.trim() || undefined,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 1,
    };

    const res = await fetch(editing ? `/api/dashboard/carosal/${editing.id}` : "/api/dashboard/carosal", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      notify(`Could not ${editing ? "update" : "create"} slide.`, "error");
      return;
    }

    notify(editing ? "Slide updated." : "Slide created.", "success");
    resetForm();
    void load();
  };

  return (
    <section className="space-y-4">
      <PageHeader
        title="Hero Carosal"
        subtitle="Create and manage hero slider items dynamically."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Carosal" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm lg:col-span-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {editing ? "Edit slide" : "Add slide"}
          </h2>
          <div className="mt-4 form-stack">
            <div className="form-field">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="form-field">
              <Label>Subtitle</Label>
              <Input value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} />
            </div>
            <div className="form-field">
              <Label>Slide image</Label>
              <ImageUploader
                value={form.imageUrl}
                onChange={(next) => setForm((p) => ({ ...p, imageUrl: next }))}
                helperText="Upload hero slide image."
              />
            </div>
            <div className="form-field">
              <Label>CTA label (optional)</Label>
              <Input value={form.ctaLabel} onChange={(e) => setForm((p) => ({ ...p, ctaLabel: e.target.value }))} />
            </div>
            <div className="form-field">
              <Label>CTA link (optional)</Label>
              <Input value={form.ctaHref} onChange={(e) => setForm((p) => ({ ...p, ctaHref: e.target.value }))} placeholder="/about" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="form-field">
                <Label>Sort order</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) || 1 }))} />
              </div>
              <div className="form-field">
                <Label>Status</Label>
                <select value={form.isActive ? "active" : "inactive"} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.value === "active" }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void save()}>
                {editing ? "Update slide" : "Create slide"}
              </Button>
              {editing ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm lg:col-span-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">All slides</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[42rem] text-sm">
              <thead>
                <tr className="border-b border-border/80 bg-muted/70 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2">Preview</th>
                  <th className="px-2 py-2">Title</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Order</th>
                  <th className="px-2 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-2 py-8 text-center text-muted-foreground">Loading...</td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-2 py-8 text-center text-muted-foreground">No slides yet.</td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={
                        idx % 2 === 0
                          ? "border-b border-border/60 bg-background text-foreground transition-colors duration-200 hover:bg-muted/60"
                          : "border-b border-border/60 bg-muted/30 text-foreground transition-colors duration-200 hover:bg-muted/60"
                      }
                    >
                      <td className="px-2 py-2">
                        <div className="relative h-12 w-20 overflow-hidden rounded border border-border/70 bg-muted">
                          <Image src={row.imageUrl} alt="" fill className="object-cover" sizes="80px" />
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <p className="font-medium">{row.title}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">{row.subtitle}</p>
                      </td>
                      <td className="px-2 py-2">
                        <span className={row.isActive ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700" : "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600"}>
                          {row.isActive ? "active" : "inactive"}
                        </span>
                      </td>
                      <td className="px-2 py-2">{row.sortOrder}</td>
                      <td className="px-2 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className={buttonVariants({ variant: "outline", size: "icon-sm" })}
                            onClick={() => startEdit(row)}
                            title="Edit slide"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            className={buttonVariants({ variant: "destructive", size: "icon-sm" })}
                            onClick={() => setDeleteTarget(row)}
                            title="Delete slide"
                          >
                            <Trash2 className="size-4" />
                          </button>
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
        title="Delete slide?"
        description={`This will permanently delete "${deleteTarget?.title ?? "this slide"}".`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          void (async () => {
            const res = await fetch(`/api/dashboard/carosal/${deleteTarget.id}`, { method: "DELETE" });
            if (!res.ok) return notify("Could not delete slide.", "error");
            notify("Slide deleted.", "success");
            setDeleteTarget(null);
            void load();
          })();
        }}
      />
    </section>
  );
}
