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

type BlogRow = {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
};

function richTextToPlainText(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
}

export function EditBlogPageForm({ id }: { id: string }) {
  const router = useRouter();
  const { notify } = useToastSystem();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [itemRes, categoryRes] = await Promise.all([
          fetch(`/api/dashboard/content/blog/${id}`, { cache: "no-store" }),
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
        setTitle(item.title);
        setDescription(item.description ?? "");
        setCategory(item.category);
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
    const titleValue = title.trim();
    const descriptionValue = description.trim();
    const descriptionPlain = richTextToPlainText(descriptionValue);
    const categoryValue = category.trim();
    if (!titleValue) return notify("Title is required.", "warning");
    if (!descriptionPlain) return notify("Description is required.", "warning");
    if (!categoryValue) return notify("Category is required.", "warning");
    if (!coverImage) return notify("Featured image is required.", "warning");

    void (async () => {
      const res = await fetch(`/api/dashboard/content/blog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleValue,
          category: categoryValue,
          description: descriptionValue,
          coverImage,
        }),
      });
      if (!res.ok) {
        notify("Could not update blog.", "error");
        return;
      }
      notify("Blog updated.", "success");
      router.push("/dashboard/content/blog/blogs");
    })();
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Blog</h1>
          <p className="text-sm text-muted-foreground">
            Update title, rich description, featured image, and category.
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
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading blog...</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-content-title">Title</Label>
              <Input
                id="edit-content-title"
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
                placeholder="Write a detailed description with formatting, alignment, table, and images..."
              />
            </div>

            <div className="space-y-2">
              <Label>Featured image</Label>
              <ImageUploader
                value={coverImage}
                onChange={setCoverImage}
                maxSizeMb={5}
                helperText="Upload featured image for the blog post."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content-category">Category</Label>
              <select
                id="edit-content-category"
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
                href="/dashboard/content/blog/blogs"
                className={buttonVariants({ variant: "outline", size: "default" })}
              >
                Cancel
              </Link>
              <Button type="button" onClick={onSave}>
                Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
