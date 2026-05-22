"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { useEffect, useState } from "react";
import { ClientHeaderNav } from "@/components/layout/client-header-nav";
import { SiteLogoMark } from "@/components/layout/site-logo-mark";
import { TopHeaderBar } from "./client-top-navbar";

export function ClientHeader() {
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
    <TopHeaderBar user={user}/>
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#2c7bb6] text-white shadow-sm">
      <div className="mx-auto flex min-h-20  max-w-full md:max-w-[90%] items-center justify-between gap-3 px-4 py-2 sm:min-h-24 sm:gap-4 sm:px-6">
        <Link
          href="/"
          aria-label="Korea Muslim Community, home"
          className="relative z-10 -my-1 flex min-w-0 max-w-[65%] shrink-0 items-center sm:-my-2 sm:max-w-none"
        >
          <SiteLogoMark priority className="h-16 w-16 sm:h-20 sm:w-20" />
        </Link>
        <ClientHeaderNav user={user} />
      </div>
    </header>
    </>
  );
}
