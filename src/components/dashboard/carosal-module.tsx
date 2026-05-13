"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { useToastSystem } from "@/components/ui/toast-system";
import {
  DashboardContentLocaleTabBar,
  DashboardWriterLanguageSelect,
} from "@/components/dashboard/dashboard-locale-controls";
import type { CarouselLocaleMap, ContentLocale } from "@/lib/i18n/content-locale";

type CarouselRow = {
  id: string;
  localeContent: CarouselLocaleMap;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel?: string;
  ctaHref?: string;
  isActive: boolean;
  sortOrder: number;
};

function cloneCarouselMap(map: CarouselLocaleMap): CarouselLocaleMap {
  return JSON.parse(JSON.stringify(map)) as CarouselLocaleMap;
}

function emptyCreateState() {
  return {
    sourceLocale: "en" as ContentLocale,
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
  const [createForm, setCreateForm] = useState(emptyCreateState);
  const [editLocale, setEditLocale] = useState<ContentLocale>("en");
  const [localeContent, setLocaleContent] = useState<CarouselLocaleMap | null>(null);
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [editCtaHref, setEditCtaHref] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editSortOrder, setEditSortOrder] = useState(1);
  const [slideFormOpen, setSlideFormOpen] = useState(false);

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

  const clearSlideFormState = () => {
    setEditingId(null);
    setLocaleContent(null);
    setCreateForm(emptyCreateState());
    setEditLocale("en");
    setEditImageUrl(null);
    setEditCtaHref("");
    setEditIsActive(true);
    setEditSortOrder(1);
  };

  const resetForm = () => {
    clearSlideFormState();
    setSlideFormOpen(false);
  };

  const startEdit = (row: CarouselRow) => {
    setEditingId(row.id);
    setLocaleContent(cloneCarouselMap(row.localeContent));
    setEditLocale("en");
    setEditImageUrl(row.imageUrl);
    setEditCtaHref(row.ctaHref ?? "");
    setEditIsActive(row.isActive);
    setEditSortOrder(row.sortOrder);
    setSlideFormOpen(true);
  };

  const openCreateModal = () => {
    clearSlideFormState();
    setSlideFormOpen(true);
  };

  const patchLocale = useCallback(
    (locale: ContentLocale, patch: Partial<CarouselLocaleMap[ContentLocale]>) => {
      setLocaleContent((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [locale]: { ...prev[locale], ...patch },
        };
      });
    },
    [],
  );

  const saveCreate = async () => {
    const f = createForm;
    if (!f.title.trim() || !f.subtitle.trim() || !f.imageUrl) {
      notify("Title, subtitle and image are required.", "warning");
      return;
    }

    const res = await fetch("/api/dashboard/carosal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceLocale: f.sourceLocale,
        title: f.title.trim(),
        subtitle: f.subtitle.trim(),
        imageUrl: f.imageUrl,
        ctaLabel: f.ctaLabel.trim() || undefined,
        ctaHref: f.ctaHref.trim() || undefined,
        isActive: f.isActive,
        sortOrder: Number(f.sortOrder) || 1,
      }),
    });

    if (!res.ok) {
      notify("Could not create slide.", "error");
      return;
    }

    notify("Slide created.", "success");
    resetForm();
    void load();
  };

  const saveEdit = async () => {
    if (!editing || !localeContent) return;
    const block = localeContent[editLocale];
    if (!block.title.trim() || !block.subtitle.trim() || !editImageUrl) {
      notify("Title, subtitle and image are required for the selected language.", "warning");
      return;
    }

    const res = await fetch(`/api/dashboard/carosal/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        localeContent,
        imageUrl: editImageUrl,
        ctaHref: editCtaHref.trim() || undefined,
        isActive: editIsActive,
        sortOrder: Number(editSortOrder) || 1,
      }),
    });

    if (!res.ok) {
      notify("Could not update slide.", "error");
      return;
    }

    notify("Slide updated.", "success");
    resetForm();
    void load();
  };

  const editBlock = localeContent?.[editLocale];

  return (
    <section className="space-y-4">
      <PageHeader
        title="Hero Carosal"
        subtitle="Create and manage hero slider items dynamically."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Carosal" },
        ]}
        action={
          <Button type="button" onClick={openCreateModal}>
            Create slide
          </Button>
        }
      />

      <Dialog open={slideFormOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent
          className="max-w-5xl max-h-[min(94dvh,980px)]"
          closeButtonClassName="end-7"
        >
          <div className="max-h-[min(82dvh,760px)] space-y-4 overflow-y-auto p-5 pt-12">
            <DialogTitle>{editing ? "Edit slide" : "Create slide"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update copy per language, image, and display settings."
                : "Add a new hero slide with title, image, and optional call to action."}
            </DialogDescription>
            <div className="form-stack">
              {editing && localeContent && editBlock ? (
                <>
                  <DashboardContentLocaleTabBar value={editLocale} onChange={setEditLocale} />
                  <div className="form-field">
                    <Label>Title ({editLocale})</Label>
                    <Input
                      value={editBlock.title}
                      onChange={(e) => patchLocale(editLocale, { title: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <Label>Subtitle ({editLocale})</Label>
                    <Input
                      value={editBlock.subtitle}
                      onChange={(e) => patchLocale(editLocale, { subtitle: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <Label>CTA label ({editLocale}, optional)</Label>
                    <Input
                      value={editBlock.ctaLabel}
                      onChange={(e) => patchLocale(editLocale, { ctaLabel: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <Label>Slide image</Label>
                    <ImageUploader
                      value={editImageUrl}
                      onChange={(next) => setEditImageUrl(next)}
                      helperText="Upload hero slide image."
                    />
                  </div>
                  <div className="form-field">
                    <Label>CTA link (optional)</Label>
                    <Input
                      value={editCtaHref}
                      onChange={(e) => setEditCtaHref(e.target.value)}
                      placeholder="/about"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-field">
                      <Label>Sort order</Label>
                      <Input
                        type="number"
                        value={editSortOrder}
                        onChange={(e) => setEditSortOrder(Number(e.target.value) || 1)}
                      />
                    </div>
                    <div className="form-field">
                      <Label>Status</Label>
                      <select
                        value={editIsActive ? "active" : "inactive"}
                        onChange={(e) => setEditIsActive(e.target.value === "active")}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button type="button" onClick={() => void saveEdit()}>
                      Update slide
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <DashboardWriterLanguageSelect
                    id="carousel-create-locale"
                    value={createForm.sourceLocale}
                    onChange={(loc) => setCreateForm((p) => ({ ...p, sourceLocale: loc }))}
                  />
                  <div className="form-field">
                    <Label>Title</Label>
                    <Input
                      value={createForm.title}
                      onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
                    />
                  </div>
                  <div className="form-field">
                    <Label>Subtitle</Label>
                    <Input
                      value={createForm.subtitle}
                      onChange={(e) => setCreateForm((p) => ({ ...p, subtitle: e.target.value }))}
                    />
                  </div>
                  <div className="form-field">
                    <Label>Slide image</Label>
                    <ImageUploader
                      value={createForm.imageUrl}
                      onChange={(next) => setCreateForm((p) => ({ ...p, imageUrl: next }))}
                      helperText="Upload hero slide image."
                    />
                  </div>
                  <div className="form-field">
                    <Label>CTA label (optional)</Label>
                    <Input
                      value={createForm.ctaLabel}
                      onChange={(e) => setCreateForm((p) => ({ ...p, ctaLabel: e.target.value }))}
                    />
                  </div>
                  <div className="form-field">
                    <Label>CTA link (optional)</Label>
                    <Input
                      value={createForm.ctaHref}
                      onChange={(e) => setCreateForm((p) => ({ ...p, ctaHref: e.target.value }))}
                      placeholder="/about"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-field">
                      <Label>Sort order</Label>
                      <Input
                        type="number"
                        value={createForm.sortOrder}
                        onChange={(e) =>
                          setCreateForm((p) => ({ ...p, sortOrder: Number(e.target.value) || 1 }))
                        }
                      />
                    </div>
                    <div className="form-field">
                      <Label>Status</Label>
                      <select
                        value={createForm.isActive ? "active" : "inactive"}
                        onChange={(e) =>
                          setCreateForm((p) => ({ ...p, isActive: e.target.value === "active" }))
                        }
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button type="button" onClick={() => void saveCreate()}>
                      Create slide
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
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
                  <td colSpan={5} className="px-2 py-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-2 py-8 text-center text-muted-foreground">
                    No slides yet.
                  </td>
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
                      <span
                        className={
                          row.isActive
                            ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                            : "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600"
                        }
                      >
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
