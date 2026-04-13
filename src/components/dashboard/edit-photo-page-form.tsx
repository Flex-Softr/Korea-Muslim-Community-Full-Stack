"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToastSystem } from "@/components/ui/toast-system";

type Row = { id: string; title: string; category: string; coverImage?: string };

export function EditPhotoPageForm({ id }: { id: string }) {
  const router = useRouter();
  const { notify } = useToastSystem();
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      const [itemRes, catsRes] = await Promise.all([
        fetch(`/api/dashboard/content/photo/${id}`, { cache: "no-store" }),
        fetch("/api/dashboard/categories?type=photo", { cache: "no-store" }),
      ]);
      if (!itemRes.ok) {
        notify("Photo not found.", "error");
        router.push("/dashboard/content/photo-gallery/photos");
        return;
      }
      const item = (await itemRes.json()) as Row;
      const cats = (await catsRes.json()) as { items?: Array<{ name: string }> };
      setCaption(item.title);
      setCategory(item.category);
      setCoverImage(item.coverImage ?? null);
      setCategories((cats.items ?? []).map((c) => c.name));
      setLoading(false);
    })();
  }, [id, notify, router]);

  const onSave = () => {
    if (!caption.trim() || !category.trim() || !coverImage) {
      notify("Caption, category, and image are required.", "warning");
      return;
    }
    void (async () => {
      const res = await fetch(`/api/dashboard/content/photo/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: caption.trim(), category: category.trim(), coverImage }),
      });
      if (!res.ok) return notify("Could not update photo.", "error");
      notify("Photo updated.", "success");
      router.push("/dashboard/content/photo-gallery/photos");
    })();
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading photo...</p>;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Photo</h1>
        </div>
        <Link href="/dashboard/content/photo-gallery/photos" className={buttonVariants({ variant: "outline" })}>Back to all photos</Link>
      </div>
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm space-y-4">
        <div className="space-y-2">
          <Label>Caption</Label>
          <Input value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select category</option>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Image</Label>
          <ImageUploader value={coverImage} onChange={setCoverImage} maxSizeMb={5} />
        </div>
        <div className="flex justify-end gap-2">
          <Link href="/dashboard/content/photo-gallery/photos" className={buttonVariants({ variant: "outline" })}>Cancel</Link>
          <Button type="button" onClick={onSave}>Save</Button>
        </div>
      </div>
    </section>
  );
}
