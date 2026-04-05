export function SettingsPanel() {
  return (
    <div className="max-w-xl space-y-4 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
      <h2 className="text-lg font-medium">Settings</h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Placeholder panel. Route-specific UI belongs in{" "}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
          dashboard/settings/components
        </code>
        .
      </p>
      <ul className="list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
        <li>Profile and preferences</li>
        <li>Notifications</li>
        <li>Security (password change, 2FA)</li>
      </ul>
    </div>
  );
}
