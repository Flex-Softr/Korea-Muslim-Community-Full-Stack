export function DashboardWelcome({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome{name ? `, ${name}` : ""}
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {email ? `Signed in as ${email}.` : "You are signed in."} This page’s
        components live in{" "}
        <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
          dashboard/components
        </code>
        .
      </p>
    </div>
  );
}
