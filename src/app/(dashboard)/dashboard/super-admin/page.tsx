import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireSuperAdmin } from "@/lib/auth";

export default async function DashboardSuperAdminPage() {
  await requireSuperAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Super admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Only the Super admin role can open this route (enforced in middleware
          and on the server).
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Platform controls</CardTitle>
          <CardDescription>
            Use for global settings, dangerous operations, or full user
            management.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Promote users to Admin/Super admin via Prisma Studio, a script, or
            an internal API you add later.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
