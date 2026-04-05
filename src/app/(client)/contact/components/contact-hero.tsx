export function ContactHero() {
  return (
    <div className="mb-10">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Contact
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Route-local components live in{" "}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">
          contact/components
        </code>
        . Shared inputs come from{" "}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">
          @/components/ui
        </code>
        .
      </p>
    </div>
  );
}
