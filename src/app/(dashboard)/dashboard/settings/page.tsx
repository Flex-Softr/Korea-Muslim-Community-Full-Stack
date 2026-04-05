import { SettingsPanel } from "./components/settings-panel";

export default function DashboardSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nested dashboard route example.
        </p>
      </div>
      <SettingsPanel />
    </div>
  );
}
