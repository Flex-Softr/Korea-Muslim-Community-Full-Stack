import { auth } from "@/auth";
import { DashboardWelcome } from "./components/dashboard-welcome";

export default async function DashboardHomePage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="space-y-8">
      <DashboardWelcome
        name={user?.name}
        email={user?.email}
        role={user?.role ?? "USER"}
      />
    </div>
  );
}
