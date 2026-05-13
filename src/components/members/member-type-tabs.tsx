"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MEMBER_SLUGS,
  MEMBER_NAV_LABEL_KEYS,
  slugFromSearchParam,
  type MemberSlug,
} from "@/lib/members/config";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

type LooseTranslate = (key: string) => string;

export function MemberTypeTabs({ className }: { className?: string }) {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const tt = t as LooseTranslate;
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
            {tt(MEMBER_NAV_LABEL_KEYS[slug])}
          </Link>
        );
      })}
    </nav>
  );
}
