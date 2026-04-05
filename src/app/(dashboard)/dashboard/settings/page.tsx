import { SettingsPanel } from "./components/settings-panel";

export default function DashboardSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Nested dashboard route example.
        </p>
      </div>
      <SettingsPanel />
    </div>
  );
}
