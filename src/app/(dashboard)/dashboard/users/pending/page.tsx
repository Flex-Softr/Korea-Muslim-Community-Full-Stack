import { auth } from "@/auth";
import { PendingUsersModule } from "@/components/dashboard/pending-users-module";
import { hasMinimumRole } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function DashboardPendingUsersPage() {
  const session = await auth();
  if (!session?.user?.id || !hasMinimumRole(session.user.role, "ADMIN")) {
    redirect("/dashboard");
  }
  return <PendingUsersModule />;
}
