"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToastSystem } from "@/components/ui/toast-system";

export function AddPhotoPageForm() {
  const router = useRouter();
  const { notify } = useToastSystem();
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/dashboard/categories?type=photo", { cache: "no-store" });
      const data = (await res.json()) as { items?: Array<{ name: string }> };
      if (res.ok) setCategories((data.items ?? []).map((item) => item.name));
    })();
  }, []);

  const onCreate = () => {
    if (!caption.trim() || !category.trim() || !coverImage) {
      notify("Caption, category, and image are required.", "warning");
      return;
    }
    void (async () => {
      const res = await fetch("/api/dashboard/content/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: caption.trim(),
          category: category.trim(),
          coverImage,
        }),
      });
      if (!res.ok) return notify("Could not create photo.", "error");
      notify("Photo created.", "success");
      router.push("/dashboard/content/photo-gallery/photos");
    })();
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add Photo</h1>
          <p className="text-sm text-muted-foreground">Create a new photo gallery item.</p>
        </div>
        <Link href="/dashboard/content/photo-gallery/photos" className={buttonVariants({ variant: "outline" })}>
          Back to all photos
        </Link>
      </div>
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm space-y-4">
        <div className="space-y-2">
          <Label htmlFor="photo-caption">Caption</Label>
          <Input id="photo-caption" value={caption} onChange={(e) => setCaption(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="photo-category">Category</Label>
          <select id="photo-category" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
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
          <Button type="button" onClick={onCreate}>Create</Button>
        </div>
      </div>
    </section>
  );
}
