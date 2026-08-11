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
import {
  isExternalHttpUrl,
  normalizeDownloadFileSource,
  validateDownloadFileUrl,
  type DownloadFileSource,
} from "@/lib/download-file";

const LIST_HREF = "/dashboard/content/download/items";

type DownloadRow = {
  id: string;
  title: string;
  category: string;
  coverImage?: string;
  fileUrl?: string;
  fileSource?: DownloadFileSource;
};

export function DownloadPageForm({ id }: { id?: string }) {
  const router = useRouter();
  const { notify } = useToastSystem();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileSource, setFileSource] = useState<DownloadFileSource>("upload");
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = Boolean(id);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    void (async () => {
      try {
        const res = await fetch(`/api/dashboard/download/${id}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          notify("Download item not found.", "error");
          router.push(LIST_HREF);
          return;
        }
        const item = (await res.json()) as DownloadRow;
        if (!alive) return;
        setTitle(item.title ?? "");
        setCategory(item.category ?? "");
        setCoverImage(item.coverImage ?? null);
        setFileUrl(item.fileUrl ?? null);
        setFileSource(
          normalizeDownloadFileSource(item.fileSource, item.fileUrl),
        );
      } catch {
        if (alive) {
          notify("Failed to load download item details.", "error");
        }
      } finally {
        if (alive) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, notify, router]);

  const switchFileSource = (next: DownloadFileSource) => {
    if (next === fileSource) return;
    setFileSource(next);
    setFileUrl(null);
  };

  const onSubmit = () => {
    if (isSubmitting) return;
    const titleValue = title.trim();
    const categoryValue = category.trim();
    if (!titleValue) return notify("Title is required.", "warning");
    if (!categoryValue) return notify("Category is required.", "warning");
    if (!coverImage) return notify("Image is required.", "warning");
    const fileError = validateDownloadFileUrl(fileUrl ?? "", fileSource);
    if (fileError) {
      return notify(
        fileSource === "external"
          ? "A valid direct file URL is required."
          : "File upload is required.",
        "warning",
      );
    }
    setIsSubmitting(true);
    void (async () => {
      try {
        const res = await fetch(
          id ? `/api/dashboard/download/${id}` : "/api/dashboard/download",
          {
            method: id ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sourceLocale: "en",
              title: titleValue,
              category: categoryValue,
              description: "",
              coverImage,
              fileUrl: fileUrl?.trim() ?? "",
              fileSource,
            }),
          },
        );
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          notify(
            data?.error ??
              `Could not ${isEdit ? "update" : "create"} download item.`,
            "error",
          );
          return;
        }
        notify(`Download item ${isEdit ? "updated" : "created"}.`, "success");

        setTitle("");
        setCategory("");
        setCoverImage(null);
        setFileUrl(null);
        setFileSource("upload");

        router.push(LIST_HREF);
      } catch {
        notify(
          `Could not ${isEdit ? "update" : "create"} download item.`,
          "error",
        );
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const categories2: { name: string; path: string }[] = [
    { name: "PDF", path: "pdf" },
    { name: "eBook & Leaflet", path: "ebook_leaflet" },
    { name: "Book", path: "book" },
    { name: "Form", path: "form" },
    { name: "Poster", path: "poster" },
    { name: "Syllabus", path: "Syllabus" },
  ];

  const categoryOptions = [...categories2];
  if (
    category &&
    !categoryOptions.some(
      (item) => item.path === category || item.name === category,
    )
  ) {
    categoryOptions.push({ name: category, path: category });
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border/80 bg-card">
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading download item details...
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {isEdit ? "Edit" : "Add"} Download
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload a file or paste a direct download URL (Google Drive, etc.).
          </p>
        </div>
        <Link
          href={LIST_HREF}
          className={buttonVariants({ variant: "outline", size: "default" })}
        >
          Back to downloads
        </Link>
      </div>

      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="download-title">Title</Label>
            <Input
              id="download-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={180}
            />
          </div>
          <div className="space-y-2">
            <Label>Image</Label>
            <ImageUploader
              value={coverImage}
              onChange={setCoverImage}
              maxSizeMb={5}
              uploadType="download"
              uploadFolder="images"
              helperText="Upload cover image."
            />
          </div>
          <div className="space-y-2">
            <Label>File source</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={fileSource === "upload" ? "default" : "outline"}
                onClick={() => switchFileSource("upload")}
              >
                Upload file
              </Button>
              <Button
                type="button"
                size="sm"
                variant={fileSource === "external" ? "default" : "outline"}
                onClick={() => switchFileSource("external")}
              >
                Direct URL
              </Button>
            </div>
          </div>
          {fileSource === "upload" ? (
            <div className="space-y-2">
              <Label>File</Label>
              <FileUploader
                value={
                  fileUrl && !isExternalHttpUrl(fileUrl) ? fileUrl : null
                }
                onChange={setFileUrl}
                uploadType="download"
                uploadFolder="files"
                helperText="Upload the downloadable file."
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="download-file-url">Direct file URL</Label>
              <Input
                id="download-file-url"
                type="url"
                inputMode="url"
                placeholder="https://drive.google.com/... or other direct link"
                value={fileUrl ?? ""}
                onChange={(event) => setFileUrl(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use a direct download link (Google Drive, Dropbox, OneDrive,
                etc.). Visitors will open this URL when they click the item.
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="download-category">Category</Label>
            <select
              id="download-category"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">Select category</option>
              {categoryOptions.map((item) => (
                <option key={item.path} value={item.path}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Link
              href={LIST_HREF}
              className={buttonVariants({
                variant: "outline",
                size: "default",
              })}
            >
              Cancel
            </Link>
            <Button
              type="button"
              onClick={onSubmit}
              isLoading={isSubmitting}
              loadingText="Saving..."
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
