"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToastSystem } from "@/components/ui/toast-system";
import { DashboardContentLocaleTabBar } from "@/components/dashboard/dashboard-locale-controls";
import type { ContentLocale, LocaleContentMap } from "@/lib/i18n/content-locale";

type Row = {
  id: string;
  localeContent: LocaleContentMap;
  coverImage?: string;
};

function cloneLocaleMap(map: LocaleContentMap): LocaleContentMap {
  return JSON.parse(JSON.stringify(map)) as LocaleContentMap;
}

export function EditPhotoPageForm({ id }: { id: string }) {
  const router = useRouter();
  const { notify } = useToastSystem();
  const [loading, setLoading] = useState(true);
  const [editLocale, setEditLocale] = useState<ContentLocale>("en");
  const [localeContent, setLocaleContent] = useState<LocaleContentMap | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const patchLocale = useCallback(
    (locale: ContentLocale, patch: Partial<LocaleContentMap[ContentLocale]>) => {
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

  useEffect(() => {
    void (async () => {
      const [itemRes, catsRes] = await Promise.all([
        fetch(`/api/dashboard/photo/${id}`, { cache: "no-store" }),
        fetch("/api/dashboard/categories?type=photo", { cache: "no-store" }),
      ]);
      if (!itemRes.ok) {
        notify("Photo not found.", "error");
        router.push("/dashboard/content/photo-gallery/photos");
        return;
      }
      const item = (await itemRes.json()) as Row;
      const cats = (await catsRes.json()) as { items?: Array<{ name: string }> };
      setLocaleContent(cloneLocaleMap(item.localeContent));
      setCoverImage(item.coverImage ?? null);
      setCategories((cats.items ?? []).map((c) => c.name));
      setLoading(false);
    })();
  }, [id, notify, router]);

  const onSave = () => {
    if (isSubmitting) return;
    if (!localeContent) return;
    const block = localeContent[editLocale];
    if (!block.title.trim() || !block.category.trim() || !coverImage) {
      notify("Caption, category, and image are required for the selected language.", "warning");
      return;
    }
    setIsSubmitting(true);
    void (async () => {
      try {
        const res = await fetch(`/api/dashboard/photo/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ localeContent, coverImage }),
        });
        if (!res.ok) return notify("Could not update photo.", "error");
        notify("Photo updated.", "success");
        router.push("/dashboard/content/photo-gallery/photos");
      } catch {
        notify("Could not update photo.", "error");
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const block = localeContent?.[editLocale];

  if (loading || !localeContent || !block) {
    return <p className="text-sm text-muted-foreground">Loading photo...</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Photo</h1>
          <p className="text-sm text-muted-foreground">Caption and category are stored per language.</p>
        </div>
        <Link href="/dashboard/content/photo-gallery/photos" className={buttonVariants({ variant: "outline" })}>
          Back to all photos
        </Link>
      </div>
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm space-y-4">
        <DashboardContentLocaleTabBar value={editLocale} onChange={setEditLocale} />
        <div className="space-y-2">
          <Label>Caption ({editLocale})</Label>
          <Input value={block.title} onChange={(e) => patchLocale(editLocale, { title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Category ({editLocale})</Label>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={block.category}
            onChange={(e) => patchLocale(editLocale, { category: e.target.value })}
          >
            <option value="">Select category</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Image</Label>
          <ImageUploader value={coverImage} onChange={setCoverImage} maxSizeMb={5} />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-4">
          <div className="flex gap-2">
            <Link href="/dashboard/content/photo-gallery/photos" className={buttonVariants({ variant: "outline" })}>
              Cancel
            </Link>
            <Button type="button" onClick={onSave} isLoading={isSubmitting} loadingText="Saving...">
              Save
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
