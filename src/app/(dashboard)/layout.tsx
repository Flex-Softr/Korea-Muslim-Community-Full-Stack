import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="flex h-[100dvh] min-h-0 w-full flex-col overflow-hidden bg-background md:flex-row">
      <DashboardSidebar role={user.role} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <DashboardHeader
          email={user.email ?? ""}
          name={user.name}
        />
        <main className="min-h-0 flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
