"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToastSystem } from "@/components/ui/toast-system";
import { DashboardWriterLanguageSelect } from "@/components/dashboard/dashboard-locale-controls";
import type { ContentLocale } from "@/lib/i18n/content-locale";

export function AddVideoPageForm() {
  const router = useRouter();
  const { notify } = useToastSystem();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [sourceLocale, setSourceLocale] = useState<ContentLocale>("en");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/dashboard/categories?type=video", { cache: "no-store" });
      const data = (await res.json()) as { items?: Array<{ name: string }> };
      if (res.ok) setCategories((data.items ?? []).map((item) => item.name));
    })();
  }, []);

  const onCreate = () => {
    if (isSubmitting) return;
    if (!title.trim() || !category.trim() || !videoUrl.trim()) {
      notify("Title, category, and video URL are required.", "warning");
      return;
    }
    setIsSubmitting(true);
    void (async () => {
      try {
        const res = await fetch("/api/dashboard/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceLocale,
            title: title.trim(),
            category: category.trim(),
            videoUrl: videoUrl.trim(),
          }),
        });
        if (!res.ok) return notify("Could not create video.", "error");
        notify("Video created.", "success");
        router.push("/dashboard/content/video-gallery/videos");
      } catch {
        notify("Could not create video.", "error");
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Add Video</h1>
        <Link href="/dashboard/content/video-gallery/videos" className={buttonVariants({ variant: "outline" })}>Back to all videos</Link>
      </div>
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm space-y-4">
        <DashboardWriterLanguageSelect
          id="create-video-source-locale"
          value={sourceLocale}
          onChange={setSourceLocale}
        />
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
          <Button type="button" onClick={onCreate} isLoading={isSubmitting} loadingText="Creating...">
            Create
          </Button>
        </div>
      </div>
    </section>
  );
}
