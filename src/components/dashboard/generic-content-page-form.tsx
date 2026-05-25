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
  DashboardWriterLanguageSelect,
} from "@/components/dashboard/dashboard-locale-controls";
import type { ContentLocale, LocaleContentMap } from "@/lib/i18n/content-locale";

type GenericContentType = "article" | "news" | "other-page";

const CONFIG = {
  article: {
    api: "/api/dashboard/article",
    categoryType: "article",
    label: "Article",
    plural: "Articles",
    listHref: "/dashboard/content/article/articles",
  },
  news: {
    api: "/api/dashboard/news",
    categoryType: "news",
    label: "News",
    plural: "News",
    listHref: "/dashboard/content/news/news",
  },
  "other-page": {
    api: "/api/dashboard/other-page-data",
    categoryType: "other-page",
    label: "Page Data",
    plural: "Other Pages Data",
    listHref: "/dashboard/content/other-pages-data/items",
  },
} as const;

type ContentRow = {
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

export function AddGenericContentPageForm({ type }: { type: GenericContentType }) {
  const config = CONFIG[type];
  const router = useRouter();
  const { notify } = useToastSystem();
  const [sourceLocale, setSourceLocale] = useState<ContentLocale>("en");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadCategories = async () => {
      try {
        const res = await fetch(`/api/dashboard/categories?type=${config.categoryType}`, { cache: "no-store" });
        const data = (await res.json()) as { items?: Array<{ name: string }> };
        if (!res.ok || cancelled) return;
        setCategories((data.items ?? []).map((item) => item.name));
      } catch {
        if (!cancelled) notify(`Could not load ${config.label.toLowerCase()} categories.`, "error");
      }
    };
    void loadCategories();
    return () => {
      cancelled = true;
    };
  }, [config.categoryType, config.label, notify]);

  const onCreate = () => {
    if (isSubmitting) return;
    const titleValue = title.trim();
    const descriptionValue = description.trim();
    const categoryValue = category.trim();
    if (!titleValue) return notify("Title is required.", "warning");
    if (!richTextToPlainText(descriptionValue)) return notify("Description is required.", "warning");
    if (!categoryValue) return notify("Category is required.", "warning");
    if (!coverImage) return notify("Image is required.", "warning");

    setIsSubmitting(true);
    void (async () => {
      try {
        const res = await fetch(config.api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceLocale,
            title: titleValue,
            category: categoryValue,
            description: descriptionValue,
            coverImage,
          }),
        });
        if (!res.ok) {
          notify(`Could not create ${config.label.toLowerCase()}.`, "error");
          return;
        }
        notify(`${config.label} created.`, "success");

          // reset form
          setTitle("");
          setDescription("");
          setCategory("");
          setCoverImage(null);
          setSourceLocale("en");
          
          // optional redirect
          router.push(config.listHref);
      } catch {
        notify(`Could not create ${config.label.toLowerCase()}.`, "error");
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add {config.label}</h1>
          <p className="text-sm text-muted-foreground">Create a new record with image, title, description, and category.</p>
        </div>
        <Link href={config.listHref} className={buttonVariants({ variant: "outline", size: "default" })}>
          Back to all {config.plural.toLowerCase()}
        </Link>
      </div>

      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="space-y-4">
          <DashboardWriterLanguageSelect id={`${type}-source-locale`} value={sourceLocale} onChange={setSourceLocale} />
          <div className="space-y-2">
            <Label htmlFor={`${type}-title`}>Title</Label>
            <Input id={`${type}-title`} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={180} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <RichTextEditor value={description} onChange={setDescription} uploadType={type} placeholder="Write the description..." />
          </div>
          <div className="space-y-2">
            <Label>Image</Label>
            <ImageUploader value={coverImage} onChange={setCoverImage} maxSizeMb={5} uploadType={type} helperText="Upload image for this record." />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${type}-category`}>Category</Label>
            <select
              id={`${type}-category`}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Link href={config.listHref} className={buttonVariants({ variant: "outline", size: "default" })}>
              Cancel
            </Link>
            <Button type="button" onClick={onCreate} isLoading={isSubmitting} loadingText="Creating...">
              Create
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EditGenericContentPageForm({ type, id }: { type: GenericContentType; id: string }) {
  const config = CONFIG[type];
  const router = useRouter();
  const { notify } = useToastSystem();
  const [loading, setLoading] = useState(true);
  const [editLocale, setEditLocale] = useState<ContentLocale>("en");
  const [localeContent, setLocaleContent] = useState<LocaleContentMap | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const patchLocale = useCallback((locale: ContentLocale, patch: Partial<LocaleContentMap[ContentLocale]>) => {
    setLocaleContent((prev) => {
      if (!prev) return prev;
      return { ...prev, [locale]: { ...prev[locale], ...patch } };
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [itemRes, categoryRes] = await Promise.all([
          fetch(`${config.api}/${id}`, { cache: "no-store" }),
          fetch(`/api/dashboard/categories?type=${config.categoryType}`, { cache: "no-store" }),
        ]);
        if (!itemRes.ok) {
          notify(`${config.label} not found.`, "error");
          router.push(config.listHref);
          return;
        }
        const item = (await itemRes.json()) as ContentRow;
        const categoryData = (await categoryRes.json()) as { items?: Array<{ name: string }> };
        if (cancelled) return;
        setLocaleContent(cloneLocaleMap(item.localeContent));
        setCoverImage(item.coverImage ?? null);
        setCategories((categoryData.items ?? []).map((c) => c.name));
      } catch {
        if (!cancelled) notify(`Could not load ${config.label.toLowerCase()}.`, "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [config.api, config.categoryType, config.label, config.listHref, id, notify, router]);

  const onSave = () => {
    if (isSubmitting || !localeContent) return;
    const block = localeContent[editLocale];
    if (!block.title.trim()) return notify("Title is required for the selected language.", "warning");
    if (!richTextToPlainText(block.description.trim())) return notify("Description is required for the selected language.", "warning");
    if (!block.category.trim()) return notify("Category is required for the selected language.", "warning");
    if (!coverImage) return notify("Image is required.", "warning");

    setIsSubmitting(true);
    void (async () => {
      try {
        const res = await fetch(`${config.api}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ localeContent, coverImage }),
        });
        if (!res.ok) {
          notify(`Could not update ${config.label.toLowerCase()}.`, "error");
          return;
        }
        notify(`${config.label} updated.`, "success");
        router.push(config.listHref);
      } catch {
        notify(`Could not update ${config.label.toLowerCase()}.`, "error");
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
          <h1 className="text-2xl font-semibold tracking-tight">Edit {config.label}</h1>
          <p className="text-sm text-muted-foreground">Edit each language using the tabs above. Save when you are done.</p>
        </div>
        <Link href={config.listHref} className={buttonVariants({ variant: "outline", size: "default" })}>
          Back to all {config.plural.toLowerCase()}
        </Link>
      </div>

      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        {loading || !localeContent || !block ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-4">
            <DashboardContentLocaleTabBar value={editLocale} onChange={setEditLocale} />
            <div className="space-y-2">
              <Label htmlFor={`${type}-edit-title`}>Title ({editLocale})</Label>
              <Input id={`${type}-edit-title`} value={block.title} onChange={(e) => patchLocale(editLocale, { title: e.target.value })} maxLength={180} />
            </div>
            <div className="space-y-2">
              <Label>Description ({editLocale})</Label>
              <RichTextEditor value={block.description} onChange={(value) => patchLocale(editLocale, { description: value })} uploadType={type} />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <ImageUploader value={coverImage} onChange={setCoverImage} maxSizeMb={5} uploadType={type} helperText="Upload image for this record." />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${type}-edit-category`}>Category ({editLocale})</Label>
              <select
                id={`${type}-edit-category`}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={block.category}
                onChange={(e) => patchLocale(editLocale, { category: e.target.value })}
              >
                <option value="">Select category</option>
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
              <Link href={config.listHref} className={buttonVariants({ variant: "outline", size: "default" })}>
                Cancel
              </Link>
              <Button type="button" onClick={onSave} isLoading={isSubmitting} loadingText="Saving...">
                Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
