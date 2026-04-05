import Link from "next/link";
import { auth } from "@/auth";
import { ClientUserMenu } from "@/components/layout/client-user-menu";

const links = [
  { href: "/", label: "Home" },
  { href: "/contact", label: "Contact" },
];

export async function ClientHeader() {
  const session = await auth();

  return (
    <header className="border-b border-zinc-200 bg-background/80 backdrop-blur dark:border-zinc-800">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          App
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-zinc-600 hover:text-foreground dark:text-zinc-400"
            >
              {l.label}
            </Link>
          ))}
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="text-zinc-600 hover:text-foreground dark:text-zinc-400"
              >
                Dashboard
              </Link>
              <ClientUserMenu email={session.user.email ?? ""} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-zinc-600 hover:text-foreground dark:text-zinc-400"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-foreground px-3 py-1.5 text-background hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
