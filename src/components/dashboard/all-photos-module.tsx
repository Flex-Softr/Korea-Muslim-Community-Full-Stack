"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmActionModal } from "@/components/ui/confirm-action-modal";
import { PageHeader } from "@/components/ui/page-header";
import { ReusablePagination } from "@/components/ui/reusable-pagination";
import { useToastSystem } from "@/components/ui/toast-system";

type MediaRow = {
  id: string;
  title: string;
  category: string;
  coverImage?: string;
  dateIso: string;
  videoUrl?: string;
};

const PAGE_SIZE = 10;

function formatDate(dateIso: string): string {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function yearFromIso(dateIso: string): number {
  return Number.parseInt(dateIso.slice(0, 4), 10);
}

export function AllPhotosModule() {
  return (
    <MediaRowsModule
      contentType="photo"
      title="All Photos"
      subtitle="Manage photo gallery items with category and year filters."
      nounPlural="photos"
      addHref="/dashboard/content/photo-gallery/photos/add"
      editHrefBase="/dashboard/content/photo-gallery/photos"
    />
  );
}

export function AllVideosModule() {
  return (
    <MediaRowsModule
      contentType="video"
      title="All Videos"
      subtitle="Manage video gallery items with category and year filters."
      nounPlural="videos"
      addHref="/dashboard/content/video-gallery/videos/add"
      editHrefBase="/dashboard/content/video-gallery/videos"
    />
  );
}

function MediaRowsModule({
  contentType,
  title,
  subtitle,
  nounPlural,
  addHref,
  editHrefBase,
}: {
  contentType: "photo" | "video";
  title: string;
  subtitle: string;
  nounPlural: string;
  addHref: string;
  editHrefBase: string;
}) {
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MediaRow | null>(null);
  const { notify } = useToastSystem();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard/content/${contentType}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as { items?: MediaRow[] };
        if (!res.ok) {
          throw new Error("Failed to load items");
        }
        if (cancelled) return;
        const items = data.items ?? [];
        setRows(items);
        setCategories([...new Set(items.map((item) => item.category))].sort((a, b) => a.localeCompare(b)));
        setYears(
          [...new Set(items.map((item) => yearFromIso(item.dateIso)))]
            .filter(Number.isFinite)
            .sort((a, b) => b - a),
        );
      } catch {
        if (!cancelled) notify(`Could not load ${nounPlural}.`, "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [contentType, nounPlural, notify]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (selectedCategory && row.category !== selectedCategory) return false;
      if (selectedYear && yearFromIso(row.dateIso) !== Number.parseInt(selectedYear, 10)) {
        return false;
      }
      return true;
    });
  }, [rows, selectedCategory, selectedYear]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedYear]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const offset = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(offset, offset + PAGE_SIZE);

  return (
    <section className="space-y-4">
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Content" },
          { label: contentType === "photo" ? "Photos" : "Videos" },
        ]}
        action={
          <Link href={addHref} className={buttonVariants({ variant: "default", size: "default" })}>
            Add {contentType === "photo" ? "Photo" : "Video"}
          </Link>
        }
      />

      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="mb-4 grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="photos-category-filter" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Category
            </label>
            <select
              id="photos-category-filter"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="photos-year-filter" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Year
            </label>
            <select
              id="photos-year-filter"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">All years</option>
              {years.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2">{contentType === "photo" ? "Caption" : "Title"}</th>
                <th className="px-2 py-2">Category</th>
                <th className="px-2 py-2">Year</th>
                {contentType === "photo" ? <th className="px-2 py-2">Image</th> : null}
                <th className="px-2 py-2">Created At</th>
                <th className="px-2 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={contentType === "photo" ? 6 : 5} className="px-2 py-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={contentType === "photo" ? 6 : 5} className="px-2 py-8 text-center text-muted-foreground">
                    No {nounPlural} found.
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr key={row.id} className="border-b border-border/60">
                    <td className="px-2 py-2 font-medium">{row.title}</td>
                    <td className="px-2 py-2">{row.category}</td>
                    <td className="px-2 py-2">{yearFromIso(row.dateIso)}</td>
                    {contentType === "photo" ? (
                      <td className="px-2 py-2">
                        <div className="relative h-12 w-16 overflow-hidden rounded border border-border/70 bg-muted">
                          <Image
                            src={row.coverImage || "/brand/logo.png"}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      </td>
                    ) : null}
                    <td className="px-2 py-2 text-muted-foreground">
                      {formatDate(row.dateIso)}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`${editHrefBase}/${row.id}/edit`}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className={buttonVariants({ variant: "destructive", size: "sm" })}
                          onClick={() => setDeleteTarget(row)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && totalPages > 1 ? (
          <div className="mt-6 space-y-2">
            <p className="text-xs text-muted-foreground">
              {title} pagination - Page {safePage} of {totalPages}
            </p>
            <ReusablePagination
              currentPage={safePage}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
        ) : null}
      </div>
      <ConfirmActionModal
        open={deleteTarget != null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete ${contentType}?`}
        description={`This will permanently delete ${deleteTarget?.title ?? `this ${contentType}`}.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="destructive"
        onConfirm={() => {
          if (!deleteTarget) return;
          void (async () => {
            const res = await fetch(`/api/dashboard/content/${contentType}/${deleteTarget.id}`, {
              method: "DELETE",
            });
            if (!res.ok) {
              notify(`Could not delete ${contentType}.`, "error");
              return;
            }
            setRows((cur) => cur.filter((row) => row.id !== deleteTarget.id));
            setDeleteTarget(null);
            notify(`${contentType === "photo" ? "Photo" : "Video"} deleted.`, "success");
          })();
        }}
      />
    </section>
  );
}
