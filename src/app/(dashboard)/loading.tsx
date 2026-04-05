export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-4 w-full max-w-md rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-4 w-full max-w-sm rounded bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
