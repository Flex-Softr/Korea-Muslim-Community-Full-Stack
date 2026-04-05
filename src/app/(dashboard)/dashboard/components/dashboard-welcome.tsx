import type { UserRole } from "@/lib/roles";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/roles";

export function DashboardWelcome({
  name,
  email,
  role,
}: {
  name?: string | null;
  email?: string | null;
  role: UserRole;
}) {
  return (
    <Card className="border-border/80 bg-card/50 shadow-sm">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-semibold">
            Welcome{name ? `, ${name}` : ""}
          </CardTitle>
          <CardDescription className="break-words">
            {email ? `Signed in as ${email}.` : "You are signed in."} Route
            components live in{" "}
            <code className="break-all rounded bg-muted px-1 py-0.5 text-xs font-medium text-foreground sm:break-normal">
              dashboard/components
            </code>
            .
          </CardDescription>
        </div>
        <Badge variant="secondary" className="w-fit shrink-0">
          {ROLE_LABELS[role]}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="break-words text-sm text-muted-foreground">
          Add widgets and data views here. Shell UI (sidebar, header) stays in{" "}
          <code className="break-all rounded bg-muted px-1 py-0.5 text-xs font-medium text-foreground sm:break-normal">
            (dashboard)/layout.tsx
          </code>
          .
        </p>
      </CardContent>
    </Card>
  );
}
