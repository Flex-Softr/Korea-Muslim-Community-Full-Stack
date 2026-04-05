import Link from "next/link";

export function ClientFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:px-6">
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <Link
            href="/privacy"
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Terms
          </Link>
        </nav>
        <p className="text-center text-sm text-muted-foreground">
          Generic starter — replace this footer with your product links and
          legal copy.
        </p>
      </div>
    </footer>
  );
}
