"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToastSystem } from "@/components/ui/toast-system";

type Row = { id: string; title: string; category: string; videoUrl?: string };

export function EditVideoPageForm({ id }: { id: string }) {
  const router = useRouter();
  const { notify } = useToastSystem();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      const [itemRes, catsRes] = await Promise.all([
        fetch(`/api/dashboard/content/video/${id}`, { cache: "no-store" }),
        fetch("/api/dashboard/categories?type=video", { cache: "no-store" }),
      ]);
      if (!itemRes.ok) {
        notify("Video not found.", "error");
        router.push("/dashboard/content/video-gallery/videos");
        return;
      }
      const item = (await itemRes.json()) as Row;
      const cats = (await catsRes.json()) as { items?: Array<{ name: string }> };
      setTitle(item.title);
      setCategory(item.category);
      setVideoUrl(item.videoUrl ?? "");
      setCategories((cats.items ?? []).map((c) => c.name));
      setLoading(false);
    })();
  }, [id, notify, router]);

  const onSave = () => {
    if (!title.trim() || !category.trim() || !videoUrl.trim()) {
      notify("Title, category, and video URL are required.", "warning");
      return;
    }
    void (async () => {
      const res = await fetch(`/api/dashboard/content/video/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), category: category.trim(), videoUrl: videoUrl.trim() }),
      });
      if (!res.ok) return notify("Could not update video.", "error");
      notify("Video updated.", "success");
      router.push("/dashboard/content/video-gallery/videos");
    })();
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading video...</p>;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Edit Video</h1>
        <Link href="/dashboard/content/video-gallery/videos" className={buttonVariants({ variant: "outline" })}>Back to all videos</Link>
      </div>
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm space-y-4">
        <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="space-y-2"><Label>Video URL</Label><Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} /></div>
        <div className="space-y-2">
          <Label>Category</Label>
          <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select category</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <Link href="/dashboard/content/video-gallery/videos" className={buttonVariants({ variant: "outline" })}>Cancel</Link>
          <Button type="button" onClick={onSave}>Save</Button>
        </div>
      </div>
    </section>
  );
}
