import Link from "next/link";
import { auth } from "@/auth";
import { ClientHeaderNav } from "@/components/layout/client-header-nav";
import { SiteLogoMark } from "@/components/layout/site-logo-mark";

export async function ClientHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#2c7bb6] text-white shadow-sm">
      <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-start gap-3 px-4 py-2 sm:gap-4 sm:px-6">
        <Link
          href="/"
          aria-label="Korea Muslim Community, home"
          className="flex min-w-0 max-w-[65%] shrink-0 items-center sm:max-w-none"
        >
          <SiteLogoMark priority />
        </Link>
        <ClientHeaderNav user={session?.user ?? null} />
      </div>
    </header>
  );
}
