import Link from "next/link";

export function HomeActions() {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
      <Link
        href="/register"
        className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
      >
        Create account
      </Link>
      <Link
        href="/login"
        className="inline-flex items-center justify-center rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
      >
        Log in
      </Link>
      <Link
        href="/contact"
        className="text-sm font-medium text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
      >
        Contact
      </Link>
    </div>
  );
}
