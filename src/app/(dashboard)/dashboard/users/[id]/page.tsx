import { auth } from "@/auth";
import { UserDetailsCard } from "@/components/dashboard/user-details-card";
import { hasMinimumRole } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function DashboardUserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || !hasMinimumRole(session.user.role, "ADMIN")) {
    redirect("/dashboard");
  }
  const { id } = await params;
  return <UserDetailsCard id={id} />;
}
