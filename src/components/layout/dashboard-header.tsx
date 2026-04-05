import Link from "next/link";
import { DashboardSignOut } from "@/components/layout/dashboard-sign-out";

export function DashboardHeader({
  email,
  name,
}: {
  email: string;
  name?: string | null;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-background px-6 dark:border-zinc-800">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:text-foreground"
      >
        ← Back to site
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <span className="hidden text-zinc-600 sm:inline dark:text-zinc-400">
          {name || email}
        </span>
        <DashboardSignOut />
      </div>
    </header>
  );
}
