"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

function currentPathWithQuery(pathname: string, searchParams: URLSearchParams | null) {
  const query = searchParams?.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/**
 * Absolute page URL for Google Translate — must not depend on `window` so SSR and the
 * first client render match (avoids hydration mismatches).
 */
function absolutePageUrlForTranslate(localPath: string): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) {
    return localPath;
  }
  try {
    const base = raw.endsWith("/") ? raw : `${raw}/`;
    return new URL(localPath.startsWith("/") ? localPath : `/${localPath}`, base).href;
  } catch {
    return localPath;
  }
}

export function BrowserTranslateToggle({ onBrand = false }: { onBrand?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const localPath = currentPathWithQuery(pathname, searchParams);
  const targetUrl = absolutePageUrlForTranslate(localPath);
  const googleKoUrl = `https://translate.google.com/translate?sl=en&tl=ko&u=${encodeURIComponent(targetUrl)}`;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-border bg-background p-0.5",
        onBrand && "border-white/30 bg-white/10",
      )}
      aria-label="Browser translation toggle"
    >
      <Link
        href={localPath}
        className={cn(
          "rounded-md px-2 py-1 text-xs font-semibold transition-all duration-200",
          onBrand
            ? "bg-white text-[#2a74a8]"
            : "bg-foreground text-background",
        )}
        aria-label="View in English"
      >
        EN
      </Link>
      <a
        href={googleKoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "rounded-md px-2 py-1 text-xs font-semibold transition-all duration-200",
          onBrand
            ? "text-white/85 hover:bg-white/15 hover:text-white"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
        aria-label="Translate this page to Korean with browser translator"
        title="Translate with Google in your browser"
      >
        KO
      </a>
    </div>
  );
}
