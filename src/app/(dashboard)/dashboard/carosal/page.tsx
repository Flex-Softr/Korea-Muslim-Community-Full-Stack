import { auth } from "@/auth";
import { CarosalModule } from "@/components/dashboard/carosal-module";
import { hasMinimumRole } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function DashboardCarosalPage() {
  const session = await auth();
  if (!session?.user?.id || !hasMinimumRole(session.user.role, "ADMIN")) {
    redirect("/dashboard");
  }
  return <CarosalModule />;
}
