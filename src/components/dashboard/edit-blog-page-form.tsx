"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useToastSystem } from "@/components/ui/toast-system";
import {
  DashboardContentLocaleTabBar,
} from "@/components/dashboard/dashboard-locale-controls";
import type { ContentLocale, LocaleContentMap } from "@/lib/i18n/content-locale";

type BlogRow = {
  id: string;
  localeContent: LocaleContentMap;
  coverImage: string;
};

function richTextToPlainText(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
}

function cloneLocaleMap(map: LocaleContentMap): LocaleContentMap {
  return JSON.parse(JSON.stringify(map)) as LocaleContentMap;
}

export function EditBlogPageForm({ id }: { id: string }) {
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
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [itemRes, categoryRes] = await Promise.all([
          fetch(`/api/dashboard/blog/${id}`, { cache: "no-store" }),
          fetch("/api/dashboard/categories?type=blog", { cache: "no-store" }),
        ]);
        if (!itemRes.ok) {
          notify("Blog not found.", "error");
          router.push("/dashboard/content/blog/blogs");
          return;
        }
        const item = (await itemRes.json()) as BlogRow;
        const categoryData = (await categoryRes.json()) as {
          items?: Array<{ id: string; name: string }>;
        };
        if (cancelled) return;
        setLocaleContent(cloneLocaleMap(item.localeContent));
        setCoverImage(item.coverImage ?? null);
        setCategories((categoryData.items ?? []).map((c) => c.name));
      } catch {
        if (!cancelled) notify("Could not load blog.", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [id, notify, router]);

  const onSave = () => {
    if (isSubmitting) return;
    if (!localeContent) return;
    const block = localeContent[editLocale];
    const titleValue = block.title.trim();
    const descriptionValue = block.description.trim();
    const descriptionPlain = richTextToPlainText(descriptionValue);
    const categoryValue = block.category.trim();
    if (!titleValue) return notify("Title is required for the selected language.", "warning");
    if (!descriptionPlain) return notify("Description is required for the selected language.", "warning");
    if (!categoryValue) return notify("Category is required for the selected language.", "warning");
    if (!coverImage) return notify("Featured image is required.", "warning");

    setIsSubmitting(true);
    void (async () => {
      try {
        const res = await fetch(`/api/dashboard/blog/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            localeContent,
            coverImage,
          }),
        });
        if (!res.ok) {
          notify("Could not update blog.", "error");
          return;
        }
        notify("Blog updated.", "success");
        router.push("/dashboard/content/blog/blogs");
      } catch {
        notify("Could not update blog.", "error");
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const block = localeContent?.[editLocale];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Blog</h1>
          <p className="text-sm text-muted-foreground">
            Edit each language using the tabs above. Save when you are done.
          </p>
        </div>
        <Link
          href="/dashboard/content/blog/blogs"
          className={buttonVariants({ variant: "outline", size: "default" })}
        >
          Back to all blogs
        </Link>
      </div>

      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        {loading || !localeContent || !block ? (
          <p className="text-sm text-muted-foreground">Loading blog...</p>
        ) : (
          <div className="space-y-4">
            <DashboardContentLocaleTabBar value={editLocale} onChange={setEditLocale} />

            <div className="space-y-2">
              <Label htmlFor="edit-content-title">Title ({editLocale})</Label>
              <Input
                id="edit-content-title"
                value={block.title}
                onChange={(e) => patchLocale(editLocale, { title: e.target.value })}
                maxLength={180}
              />
            </div>

            <div className="space-y-2">
              <Label>Description ({editLocale})</Label>
              <RichTextEditor
                value={block.description}
                onChange={(v) => patchLocale(editLocale, { description: v })}
                uploadType="blog"
                placeholder="Write a detailed description with formatting, alignment, table, and images..."
              />
            </div>

            <div className="space-y-2">
              <Label>Featured image</Label>
              <ImageUploader
                value={coverImage}
                onChange={setCoverImage}
                maxSizeMb={5}
                uploadType="blog"
                helperText="Upload featured image for the blog post."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content-category">Category ({editLocale})</Label>
              <select
                id="edit-content-category"
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

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-4">
              <div className="flex gap-2">
                <Link
                  href="/dashboard/content/blog/blogs"
                  className={buttonVariants({ variant: "outline", size: "default" })}
                >
                  Cancel
                </Link>
                <Button type="button" onClick={onSave} isLoading={isSubmitting} loadingText="Saving...">
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
