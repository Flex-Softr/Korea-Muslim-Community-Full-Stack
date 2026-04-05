export function ContactHero() {
  return (
    <div className="mb-10 text-center sm:text-left">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Contact
      </h1>
      <p className="mt-3 max-w-xl text-muted-foreground sm:max-w-none">
        Page-specific UI lives in{" "}
        <code className="rounded-md bg-muted px-1.5 py-0.5 text-sm font-medium text-foreground">
          contact/components
        </code>
        . Shared controls come from{" "}
        <code className="rounded-md bg-muted px-1.5 py-0.5 text-sm font-medium text-foreground">
          @/components/ui
        </code>
        .
      </p>
    </div>
  );
}
