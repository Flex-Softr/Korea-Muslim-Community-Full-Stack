import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdminOrAbove } from "@/lib/auth";

export default async function DashboardAdminPage() {
  await requireAdminOrAbove();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          For users with the Admin or Super admin role. Adjust access in{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">middleware.ts</code>{" "}
          and{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">src/lib/auth.ts</code>
          .
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Admin area</CardTitle>
          <CardDescription>
            Place moderation, reports, or staff-only tools here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Super admins can access this page as well.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
