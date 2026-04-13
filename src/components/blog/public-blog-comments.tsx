"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type CommentRow = {
  id: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: string;
};

function formatDate(dateIso: string): string {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleString();
}

export function PublicBlogComments({
  slug,
  canComment,
}: {
  slug: string;
  canComment: boolean;
}) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/public/blogs/${slug}/comments`, { cache: "no-store" });
      const data = (await res.json()) as { items?: CommentRow[] };
      if (!res.ok) throw new Error("Failed");
      setComments(data.items ?? []);
    } catch {
      setError("Could not load comments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const submit = () => {
    const next = content.trim();
    if (!next) return;
    void (async () => {
      const res = await fetch(`/api/public/blogs/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: next }),
      });
      if (!res.ok) {
        setError("Could not submit comment.");
        return;
      }
      setContent("");
      void load();
    })();
  };

  return (
    <section className="mt-10 space-y-4">
      <h2 className="text-xl font-semibold">Comments</h2>

      {canComment ? (
        <div className="space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button type="button" onClick={submit}>
              Post Comment
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Please{" "}
          <Link href="/login" className="text-[#2c7bb6] underline-offset-4 hover:underline">
            log in
          </Link>{" "}
          to add a comment.
        </p>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="text-sm text-muted-foreground">Loading comments...</p> : null}

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-lg border border-border/70 bg-card p-3">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{comment.userName}</span>
                <span>{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
