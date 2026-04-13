import { auth } from "@/auth";
import { UsersModule } from "@/components/dashboard/users-module";
import { hasMinimumRole } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function DashboardUsersPage() {
  const session = await auth();
  if (!session?.user?.id || !hasMinimumRole(session.user.role, "ADMIN")) {
    redirect("/dashboard");
  }
  return <UsersModule />;
}
