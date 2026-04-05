"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MEMBER_SLUGS,
  MEMBER_NAV_LABELS,
  slugFromSearchParam,
  type MemberSlug,
} from "@/lib/members/config";
import { cn } from "@/lib/utils";

export function MemberTypeTabs({ className }: { className?: string }) {
  const searchParams = useSearchParams();
  const current = slugFromSearchParam(searchParams.get("type"));

  return (
    <nav
      aria-label="Member categories"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {MEMBER_SLUGS.map((slug: MemberSlug) => {
        const isActive = slug === current;
        const q = new URLSearchParams(searchParams.toString());
        q.set("type", slug);
        const href = `/member?${q.toString()}`;

        return (
          <Link
            key={slug}
            href={href}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-[#2c7bb6] bg-[#2c7bb6] text-white shadow-sm dark:border-sky-600 dark:bg-sky-600"
                : "border-border bg-background text-foreground hover:bg-muted",
            )}
            scroll={false}
          >
            {MEMBER_NAV_LABELS[slug]}
          </Link>
        );
      })}
    </nav>
  );
}
