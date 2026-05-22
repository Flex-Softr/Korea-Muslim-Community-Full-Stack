import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { isUserRole } from "@/lib/roles";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = session.user;
  const roleParam = user.role ?? "";
  const role = isUserRole(roleParam) ? roleParam : "USER";

  return (
    <DashboardShell
      role={role}
      email={user.email ?? ""}
      name={user.name}
      image={user.image}
    >
      {children}
    </DashboardShell>
  );
}
