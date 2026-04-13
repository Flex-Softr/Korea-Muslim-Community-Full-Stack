import { auth } from "@/auth";
import { PendingBlogsModule } from "@/components/dashboard/pending-blogs-module";
import { hasMinimumRole } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function DashboardPendingBlogsPage() {
  const session = await auth();
  if (!session?.user?.id || !hasMinimumRole(session.user.role, "ADMIN")) {
    redirect("/dashboard");
  }
  return <PendingBlogsModule />;
}
