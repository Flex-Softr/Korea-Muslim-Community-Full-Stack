import { auth } from "@/auth";
import { DashboardWelcome } from "./components/dashboard-welcome";

export default async function DashboardHomePage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="space-y-8">
      <DashboardWelcome name={user?.name} email={user?.email} />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Add widgets and data views here. Use{" "}
        <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
          (dashboard)/layout.tsx
        </code>{" "}
        for shell-only UI (sidebar, header).
      </p>
    </div>
  );
}
