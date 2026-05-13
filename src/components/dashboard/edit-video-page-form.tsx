"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToastSystem } from "@/components/ui/toast-system";
import { DashboardContentLocaleTabBar } from "@/components/dashboard/dashboard-locale-controls";
import type { ContentLocale, LocaleContentMap } from "@/lib/i18n/content-locale";

type Row = {
  id: string;
  localeContent: LocaleContentMap;
  videoUrl?: string;
};

function cloneLocaleMap(map: LocaleContentMap): LocaleContentMap {
  return JSON.parse(JSON.stringify(map)) as LocaleContentMap;
}

export function EditVideoPageForm({ id }: { id: string }) {
  const router = useRouter();
  const { notify } = useToastSystem();
  const [loading, setLoading] = useState(true);
  const [editLocale, setEditLocale] = useState<ContentLocale>("en");
  const [localeContent, setLocaleContent] = useState<LocaleContentMap | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const patchLocale = useCallback(
    (locale: ContentLocale, patch: Partial<LocaleContentMap[ContentLocale]>) => {
      setLocaleContent((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [locale]: { ...prev[locale], ...patch },
        };
      });
    },
    [],
  );

  useEffect(() => {
    void (async () => {
      const [itemRes, catsRes] = await Promise.all([
        fetch(`/api/dashboard/video/${id}`, { cache: "no-store" }),
        fetch("/api/dashboard/categories?type=video", { cache: "no-store" }),
      ]);
      if (!itemRes.ok) {
        notify("Video not found.", "error");
        router.push("/dashboard/content/video-gallery/videos");
        return;
      }
      const item = (await itemRes.json()) as Row;
      const cats = (await catsRes.json()) as { items?: Array<{ name: string }> };
      setLocaleContent(cloneLocaleMap(item.localeContent));
      setVideoUrl(item.videoUrl ?? "");
      setCategories((cats.items ?? []).map((c) => c.name));
      setLoading(false);
    })();
  }, [id, notify, router]);

  const onSave = () => {
    if (isSubmitting) return;
    if (!localeContent) return;
    const block = localeContent[editLocale];
    if (!block.title.trim() || !block.category.trim() || !videoUrl.trim()) {
      notify("Title, category, and video URL are required.", "warning");
      return;
    }
    setIsSubmitting(true);
    void (async () => {
      try {
        const res = await fetch(`/api/dashboard/video/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            localeContent,
            videoUrl: videoUrl.trim(),
          }),
        });
        if (!res.ok) return notify("Could not update video.", "error");
        notify("Video updated.", "success");
        router.push("/dashboard/content/video-gallery/videos");
      } catch {
        notify("Could not update video.", "error");
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const block = localeContent?.[editLocale];

  if (loading || !localeContent || !block) {
    return <p className="text-sm text-muted-foreground">Loading video...</p>;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Video</h1>
          <p className="text-sm text-muted-foreground">Title and category are stored per language; video URL is shared.</p>
        </div>
        <Link href="/dashboard/content/video-gallery/videos" className={buttonVariants({ variant: "outline" })}>
          Back to all videos
        </Link>
      </div>
      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm space-y-4">
        <DashboardContentLocaleTabBar value={editLocale} onChange={setEditLocale} />
        <div className="space-y-2">
          <Label>Title ({editLocale})</Label>
          <Input value={block.title} onChange={(e) => patchLocale(editLocale, { title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Video URL</Label>
          <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Category ({editLocale})</Label>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={block.category}
            onChange={(e) => patchLocale(editLocale, { category: e.target.value })}
          >
            <option value="">Select category</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-4">
          <div className="flex gap-2">
            <Link href="/dashboard/content/video-gallery/videos" className={buttonVariants({ variant: "outline" })}>
              Cancel
            </Link>
            <Button type="button" onClick={onSave} isLoading={isSubmitting} loadingText="Saving...">
              Save
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
