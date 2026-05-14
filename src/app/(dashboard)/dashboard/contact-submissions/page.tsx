import { auth } from "@/auth";
import { ContactSubmissionsModule } from "@/components/dashboard/contact-submissions-module";
import { hasMinimumRole } from "@/lib/roles";
import { redirect } from "next/navigation";

export default async function DashboardContactSubmissionsPage() {
  const session = await auth();
  if (!session?.user?.id || !hasMinimumRole(session.user.role, "ADMIN")) {
    redirect("/dashboard");
  }
  return <ContactSubmissionsModule />;
}
