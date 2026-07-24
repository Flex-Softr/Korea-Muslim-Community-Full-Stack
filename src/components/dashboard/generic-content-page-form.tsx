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
import {
  CONTENT_LOCALES,
  emptyLocaleContentMap,
  type ContentLocale,
  type LocaleContentMap,
} from "@/lib/i18n/content-locale";

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

const MODULE_TAB_MAPPING = {
  "Introduction": [
    { label: "Brief Introduction", category: "Brief Introduction" },
    { label: "Constitution", category: "Constitution" },
    { label: "Organizational Method", category: "Organizational Method" },
    { label: "Policies", category: "Policies" },
    { label: "History and Tradition", category: "History and Tradition" },
    { label: "Introductory Registration", category: "Introductory Registration" },
  ],
  "Organizational Structure": [
    { label: "Central Working Procedure", category: "Central Working Procedure" },
    { label: "Central Shura Council", category: "Central Shura Council" },
    { label: "Other Leadership", category: "Other Leadership" },
  ],
  "Divisions / Procedure": [
    { label: "Women's Division", category: "Women's Division" },
    { label: "Student Division", category: "Student Division" },
    { label: "Professional Division", category: "Professional Division" },
    { label: "National & International", category: "National and International" },
  ],
  "Students": [
    { label: "Overview", category: "Students - Overview" },
    { label: "Admission", category: "Students - Admission" },
    { label: "Classes", category: "Students - Classes" },
    { label: "Events", category: "Students - Events" },
    { label: "Support", category: "Students - Support" },
    { label: "Resources", category: "Students - Resources" },
  ],
  "Education": [
    { label: "Overview", category: "Education - Overview" },
    { label: "Classes", category: "Education - Classes" },
    { label: "Events", category: "Education - Events" },
    { label: "Resources", category: "Education - Resources" },
  ],
  "EPS": [
    { label: "Form", category: "EPS - Form" },
    { label: "Link", category: "EPS - Link" },
    { label: "App", category: "EPS - App" },
  ],
  "Mosque": [
    { label: "Mosque", category: "Mosque - Mosque" },
    { label: "Korea Mosques", category: "Mosque - Korea Mosques" },
  ],
} as const;

type ModuleType = keyof typeof MODULE_TAB_MAPPING;

function findModuleAndTabByCategory(categoryStr: string) {
  const normalized =
    categoryStr?.toLowerCase() === "mosque - our mosque"
      ? "Mosque - Mosque"
      : categoryStr;
  for (const [moduleName, tabs] of Object.entries(MODULE_TAB_MAPPING)) {
    const matchedTab = tabs.find((t) => t.category.toLowerCase() === normalized?.toLowerCase());
    if (matchedTab) {
      return { module: moduleName as ModuleType, tab: matchedTab.category };
    }
  }
  return { module: "" as const, tab: "" };
}

export function AddGenericContentPageForm({ type }: { type: GenericContentType }) {
  const config = CONFIG[type];
  const router = useRouter();
  const { notify } = useToastSystem();
  const [editLocale, setEditLocale] = useState<ContentLocale>("en");
  const [localeContent, setLocaleContent] = useState<LocaleContentMap>(emptyLocaleContentMap());
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

  const patchLocale = useCallback((locale: ContentLocale, patch: Partial<LocaleContentMap[ContentLocale]>) => {
    setLocaleContent((prev) => {
      return { ...prev, [locale]: { ...prev[locale], ...patch } };
    });
  }, []);

  const setCategoryForAll = (newCategory: string) => {
    setLocaleContent((prev) => {
      const next = { ...prev };
      for (const loc of CONTENT_LOCALES) {
        next[loc] = { ...next[loc], category: newCategory };
      }
      return next;
    });
  };

  const onCreate = () => {
    if (isSubmitting) return;
    const block = localeContent[editLocale];
    const titleValue = block.title.trim();
    const descriptionValue = block.description.trim();
    const categoryValue = block.category.trim();

    if (!titleValue) return notify("Title is required for the active language.", "warning");
    if (!richTextToPlainText(descriptionValue)) return notify("Description is required for the active language.", "warning");
    if (!categoryValue) {
      if (type === "other-page") {
        return notify("Page / Tab is required.", "warning");
      } else {
        return notify("Category is required.", "warning");
      }
    }

    setIsSubmitting(true);
    void (async () => {
      try {
        const res = await fetch(config.api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceLocale: editLocale,
            localeContent,
            coverImage,
          }),
        });
        if (!res.ok) {
          notify(`Could not create ${config.label.toLowerCase()}.`, "error");
          return;
        }
        notify(`${config.label} created.`, "success");

        // reset form
        setLocaleContent(emptyLocaleContentMap());
        setCoverImage(null);
        setEditLocale("en");
        
        // redirect
        router.push(config.listHref);
      } catch {
        notify(`Could not create ${config.label.toLowerCase()}.`, "error");
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const block = localeContent[editLocale];
  const { module: activeModule, tab: activeTab } = type === "other-page" && block.category
    ? findModuleAndTabByCategory(block.category)
    : { module: "" as const, tab: "" };

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
          <DashboardContentLocaleTabBar value={editLocale} onChange={setEditLocale} />
          <div className="space-y-2">
            <Label htmlFor={`${type}-title`}>Title ({editLocale})</Label>
            <Input id={`${type}-title`} value={block.title} onChange={(e) => patchLocale(editLocale, { title: e.target.value })} maxLength={180} />
          </div>
          <div className="space-y-2">
            <Label>Description ({editLocale})</Label>
            <RichTextEditor value={block.description} onChange={(val) => patchLocale(editLocale, { description: val })} uploadType={type} placeholder="Write the description..." />
          </div>
          <div className="space-y-2">
            <Label>Image</Label>
            <ImageUploader value={coverImage} onChange={setCoverImage} maxSizeMb={5} uploadType={type} helperText="Upload image for this record." />
          </div>
          {type === "other-page" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="module-select">Module ({editLocale})</Label>
                <select
                  id="module-select"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={activeModule}
                  onChange={(e) => {
                    const nextModule = e.target.value as ModuleType;
                    const firstTab = nextModule ? MODULE_TAB_MAPPING[nextModule][0]?.category : "";
                    setCategoryForAll(firstTab);
                  }}
                >
                  <option value="">Select module</option>
                  {Object.keys(MODULE_TAB_MAPPING).map((mod) => (
                    <option key={mod} value={mod}>{mod}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tab-select">Page / Tab ({editLocale})</Label>
                <select
                  id="tab-select"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={activeTab}
                  onChange={(e) => setCategoryForAll(e.target.value)}
                  disabled={!activeModule}
                >
                  <option value="">Select page / tab</option>
                  {activeModule &&
                    MODULE_TAB_MAPPING[activeModule].map((t) => (
                      <option key={t.category} value={t.category}>
                        {t.label}
                      </option>
                    ))}
                </select>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label htmlFor={`${type}-category`}>Category ({editLocale})</Label>
              <select
                id={`${type}-category`}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={block.category}
                onChange={(e) => setCategoryForAll(e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
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
    
    if (type !== "other-page" && !block.category.trim()) {
      return notify("Category is required for the selected language.", "warning");
    }

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
  const { module: activeModule, tab: activeTab } = type === "other-page" && block?.category
    ? findModuleAndTabByCategory(block.category)
    : { module: "" as const, tab: "" };

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
            {type === "other-page" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="module-edit-select">Module ({editLocale})</Label>
                  <select
                    id="module-edit-select"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={activeModule}
                    onChange={(e) => {
                      const nextModule = e.target.value as ModuleType;
                      const firstTab = nextModule ? MODULE_TAB_MAPPING[nextModule][0]?.category : "";
                      patchLocale(editLocale, { category: firstTab });
                    }}
                  >
                    <option value="">Select module</option>
                    {Object.keys(MODULE_TAB_MAPPING).map((mod) => (
                      <option key={mod} value={mod}>{mod}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tab-edit-select">Page / Tab ({editLocale})</Label>
                  <select
                    id="tab-edit-select"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={activeTab}
                    onChange={(e) => patchLocale(editLocale, { category: e.target.value })}
                    disabled={!activeModule}
                  >
                    <option value="">Select page / tab</option>
                    {activeModule &&
                      MODULE_TAB_MAPPING[activeModule].map((t) => (
                        <option key={t.category} value={t.category}>
                          {t.label}
                        </option>
                      ))}
                  </select>
                </div>
              </>
            ) : (
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
            )}
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
