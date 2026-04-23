import { auth } from "@/auth";
import { MembersModule } from "@/components/dashboard/members-module";
import { hasMinimumRole } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function DashboardMembersPage() {
  const session = await auth();
  if (!session?.user?.id || !hasMinimumRole(session.user.role, "ADMIN")) {
    redirect("/dashboard");
  }

  return <MembersModule />;
}
