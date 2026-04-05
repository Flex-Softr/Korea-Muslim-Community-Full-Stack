import Link from "next/link";
import { auth } from "@/auth";
import { ClientHeaderNav } from "@/components/layout/client-header-nav";

export async function ClientHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold tracking-tight text-foreground"
        >
          App
        </Link>
        <ClientHeaderNav user={session?.user ?? null} />
      </div>
    </header>
  );
}
