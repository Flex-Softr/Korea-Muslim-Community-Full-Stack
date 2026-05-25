"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import * as React from "react";
import { cn } from "@/lib/utils";

export function ModeToggle({ onBrand = false }: { onBrand?: boolean }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  const toggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  if (!mounted) {
    return (
      <span
        className={cn(
          "inline-block size-9 shrink-0 animate-pulse rounded-lg",
          onBrand ? "bg-white/15" : "bg-muted",
        )}
        aria-hidden
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={
        isDark
          ? "Dark mode — click for light"
          : "Light mode — click for dark"
      }
      onClick={toggle}
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        onBrand
          ? "text-white hover:bg-zinc-800/50 focus-visible:ring-white/60 focus-visible:ring-offset-[#2c7bb6]"
          : "text-white shadow-sm shadow-zinc-800/40 hover:bg-zinc-800 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-background dark:text-zinc-300 dark:hover:bg-zinc-800",
      )}
    >
      {isDark ? (
        <Sun className="size-5" strokeWidth={2} aria-hidden />
      ) : (
        <Moon className="size-5" strokeWidth={2} aria-hidden />
      )}
    </button>
  );
}
