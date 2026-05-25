"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { FileUploader } from "@/components/ui/file-uploader";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToastSystem } from "@/components/ui/toast-system";

const LIST_HREF = "/dashboard/content/download/items";

type DownloadRow = {
  id: string;
  title: string;
  category: string;
  coverImage?: string;
  fileUrl?: string;
};

export function DownloadPageForm({ id }: { id?: string }) {
  const router = useRouter();
  const { notify } = useToastSystem();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = Boolean(id);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [categoryRes, itemRes] = await Promise.all([
        fetch("/api/dashboard/categories?type=download", { cache: "no-store" }),
        id ? fetch(`/api/dashboard/download/${id}`, { cache: "no-store" }) : Promise.resolve(null),
      ]);
      const categoryData = (await categoryRes.json()) as { items?: Array<{ name: string }> };
      if (!cancelled) {
        setCategories((categoryData.items ?? []).map((item) => item.name));
      }
      if (itemRes) {
        if (!itemRes.ok) {
          notify("Download item not found.", "error");
          router.push(LIST_HREF);
          return;
        }
        const item = (await itemRes.json()) as DownloadRow;
        if (!cancelled) {
          setTitle(item.title);
          setCategory(item.category);
          setCoverImage(item.coverImage ?? null);
          setFileUrl(item.fileUrl ?? null);
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [id, notify, router]);

  const onSubmit = () => {
    if (isSubmitting) return;
    const titleValue = title.trim();
    const categoryValue = category.trim();
    if (!titleValue) return notify("Title is required.", "warning");
    if (!categoryValue) return notify("Category is required.", "warning");
    if (!coverImage) return notify("Image is required.", "warning");
    if (!fileUrl) return notify("File upload is required.", "warning");
    setIsSubmitting(true);
    void (async () => {
      try {
        const res = await fetch(id ? `/api/dashboard/download/${id}` : "/api/dashboard/download", {
          method: id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceLocale: "en",
            title: titleValue,
            category: categoryValue,
            description: "",
            coverImage,
            fileUrl,
          }),
        });
        if (!res.ok) {
          notify(`Could not ${isEdit ? "update" : "create"} download item.`, "error");
          return;
        }
        notify(`Download item ${isEdit ? "updated" : "created"}.`, "success");

        // reset form
        setTitle("");
        setCategory("");
        setCoverImage(null);
        setFileUrl(null);
       // setSourceLocale("en");

        router.push(LIST_HREF);
      } catch {
        notify(`Could not ${isEdit ? "update" : "create"} download item.`, "error");
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{isEdit ? "Edit" : "Add"} Download</h1>
          <p className="text-sm text-muted-foreground">Upload a file with image, title, and category.</p>
        </div>
        <Link href={LIST_HREF} className={buttonVariants({ variant: "outline", size: "default" })}>
          Back to downloads
        </Link>
      </div>

      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="download-title">Title</Label>
            <Input id="download-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={180} />
          </div>
          <div className="space-y-2">
            <Label>Image</Label>
            <ImageUploader value={coverImage} onChange={setCoverImage} maxSizeMb={5} uploadType="download" uploadFolder="images" helperText="Upload cover image." />
          </div>
          <div className="space-y-2">
            <Label>File</Label>
            <FileUploader value={fileUrl} onChange={setFileUrl} uploadType="download" uploadFolder="files" helperText="Upload the downloadable file." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="download-category">Category</Label>
            <select
              id="download-category"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Link href={LIST_HREF} className={buttonVariants({ variant: "outline", size: "default" })}>
              Cancel
            </Link>
            <Button type="button" onClick={onSubmit} isLoading={isSubmitting} loadingText="Saving...">
              Save
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
