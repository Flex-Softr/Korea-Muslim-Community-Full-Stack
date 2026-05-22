import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SettingsPanel } from "./components/settings-panel";

export default async function DashboardSettingsPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    redirect("/login");
  }

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
      <SettingsPanel
        user={{
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
          isEmailVerified: session.user.isEmailVerified,
        }}
      />
    </div>
  );
}
