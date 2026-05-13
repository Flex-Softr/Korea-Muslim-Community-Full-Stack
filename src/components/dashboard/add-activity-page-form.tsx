"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useToastSystem } from "@/components/ui/toast-system";
import { DashboardWriterLanguageSelect } from "@/components/dashboard/dashboard-locale-controls";
import type { ContentLocale } from "@/lib/i18n/content-locale";

function richTextToPlainText(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
}

export function AddActivityPageForm() {
  const router = useRouter();
  const { notify } = useToastSystem();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [sourceLocale, setSourceLocale] = useState<ContentLocale>("en");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const res = await fetch("/api/dashboard/categories?type=activity", { cache: "no-store" });
        const data = (await res.json()) as {
          items?: Array<{ id: string; name: string }>;
        };
        if (!res.ok || cancelled) return;
        setCategories((data.items ?? []).map((item) => item.name));
      } catch {
        if (!cancelled) {
          notify("Could not load activity categories.", "error");
        }
      }
    };

    void loadCategories();
    return () => {
      cancelled = true;
    };
  }, [notify]);

  const onCreate = () => {
    if (isSubmitting) return;
    const titleValue = title.trim();
    const descriptionValue = description.trim();
    const descriptionPlain = richTextToPlainText(descriptionValue);
    const categoryValue = category.trim();

    if (!titleValue) {
      notify("Title is required.", "warning");
      return;
    }
    if (!descriptionPlain) {
      notify("Description is required.", "warning");
      return;
    }
    if (!categoryValue) {
      notify("Category is required.", "warning");
      return;
    }
    if (!coverImage) {
      notify("Featured image is required.", "warning");
      return;
    }

    setIsSubmitting(true);
    void (async () => {
      try {
        const res = await fetch("/api/dashboard/activity", {
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
          notify("Could not create activity.", "error");
          return;
        }
        notify("Activity created.", "success");
        router.push("/dashboard/content/activity/activities");
      } catch {
        notify("Could not create activity.", "error");
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add Activity</h1>
          <p className="text-sm text-muted-foreground">
            Create a new activity with rich description and featured image.
          </p>
        </div>
        <Link
          href="/dashboard/content/activity/activities"
          className={buttonVariants({ variant: "outline", size: "default" })}
        >
          Back to all activities
        </Link>
      </div>

      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="space-y-4">
          <DashboardWriterLanguageSelect
            id="create-activity-source-locale"
            value={sourceLocale}
            onChange={setSourceLocale}
          />

          <div className="space-y-2">
            <Label htmlFor="create-activity-title">Title</Label>
            <Input
              id="create-activity-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={180}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Write a detailed activity description with formatting, alignment, table, and images..."
            />
          </div>

          <div className="space-y-2">
            <Label>Featured image</Label>
            <ImageUploader
              value={coverImage}
              onChange={setCoverImage}
              maxSizeMb={5}
              helperText="Upload featured image for the activity."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-activity-category">Category</Label>
            <select
              id="create-activity-category"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <Link
              href="/dashboard/content/activity/activities"
              className={buttonVariants({ variant: "outline", size: "default" })}
            >
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
