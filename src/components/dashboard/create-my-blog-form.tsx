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

export function CreateMyBlogForm() {
  const router = useRouter();
  const { notify } = useToastSystem();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [sourceLocale, setSourceLocale] = useState<ContentLocale>("en");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/dashboard/categories?type=blog", { cache: "no-store" });
        const data = (await res.json()) as { items?: Array<{ name: string }> };
        if (!res.ok || cancelled) return;
        const names = (data.items ?? []).map((c) => c.name);
        setCategories(names);
        setCategory((prev) => (prev.trim() ? prev : names[0] ?? ""));
      } catch {
        if (!cancelled) notify("Could not load categories.", "error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [notify]);

  const onSubmit = () => {
    const titleValue = title.trim();
    const contentValue = content.trim();
    const plain = richTextToPlainText(contentValue);
    if (!titleValue) return notify("Title is required.", "warning");
    if (!plain) return notify("Content is required.", "warning");
    const categoryValue = category.trim() || categories[0] || "General";
    if (!categoryValue.trim()) {
      notify("Category is required. Add a blog category in the dashboard or pick one from the list.", "warning");
      return;
    }

    void (async () => {
      const res = await fetch("/api/dashboard/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceLocale,
          title: titleValue,
          category: categoryValue,
          description: contentValue,
          coverImage: thumbnail ?? "",
        }),
      });
      if (!res.ok) {
        notify("Could not create blog.", "error");
        return;
      }
      notify("Blog submitted successfully.", "success");
      router.push("/dashboard#my-blogs");
    })();
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Write Blog</h1>
          <p className="text-sm text-muted-foreground">
            Create your blog post. It will be saved as pending.
          </p>
        </div>
        <Link href="/dashboard#my-blogs" className={buttonVariants({ variant: "outline" })}>
          Back to My Blogs
        </Link>
      </div>

      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="space-y-4">
          <DashboardWriterLanguageSelect
            id="my-blog-source-locale"
            value={sourceLocale}
            onChange={setSourceLocale}
          />

          <div className="space-y-2">
            <Label htmlFor="my-blog-title">Title</Label>
            <Input
              id="my-blog-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={180}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="my-blog-category">Category</Label>
            <select
              id="my-blog-category"
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

          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              uploadType="blog"
              placeholder="Write your blog content..."
            />
          </div>

          <div className="space-y-2">
            <Label>Thumbnail (optional)</Label>
            <ImageUploader
              value={thumbnail}
              onChange={setThumbnail}
              maxSizeMb={5}
              uploadType="blog"
              helperText="Optional thumbnail image for your blog."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Link href="/dashboard#my-blogs" className={buttonVariants({ variant: "outline" })}>
              Cancel
            </Link>
            <Button type="button" onClick={onSubmit}>
              Submit Blog
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
