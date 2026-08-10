"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { useEffect, useState } from "react";
import { ClientHeaderNav } from "@/components/layout/client-header-nav";
import { SiteLogoMark } from "@/components/layout/site-logo-mark";
import { useLanguage } from "@/components/providers/language-provider";
import { TopHeaderBar } from "./client-top-navbar";
import { cn } from "@/lib/utils";

export function ClientHeader() {
  const { t, lang } = useLanguage();
  const brandTitle = t("header.brandTitle");
  const [user, setUser] = useState<Session["user"] | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = (await res.json().catch(() => null)) as Session | null;
        if (active) setUser(data?.user ?? null);
      } catch {
        if (active) setUser(null);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <TopHeaderBar user={user} />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#2c7bb6] text-white shadow-sm">
        <div className="mx-auto flex min-h-14 max-w-full items-center justify-between gap-2.5 px-4 py-1.5 sm:min-h-16 sm:gap-3 sm:px-6 md:max-w-[90%]">
          <Link
            href="/"
            aria-label={`${brandTitle}, home`}
            className="relative z-10 flex min-w-0 shrink-0 items-center gap-2 sm:max-w-[min(40%,14rem)] sm:gap-2.5 md:max-w-none"
          >
            <SiteLogoMark priority className="h-11 w-11 shrink-0 sm:h-12 sm:w-12" />
            <div className="flex flex-col min-w-0">
              <span
                className={cn(
                  "whitespace-nowrap sm:whitespace-normal min-w-0 text-left font-bold leading-[1.15] text-white",
                  "text-md sm:text-lg lg:text-xl",
                  lang === "bn" && "tracking-normal",
                )}
              >
                {brandTitle}
              </span>
              <span className="block sm:hidden text-xs text-white/80 whitespace-nowrap font-medium">
                {t("header.brandTitle", { lng: lang === "en" ? "bn" : "en" })}
              </span>
            </div>
          </Link>
          <ClientHeaderNav user={user} />
        </div>
      </header>
    </>
  );
}
