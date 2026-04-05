import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResetPasswordForm } from "./components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="shadow-lg ring-1 ring-border/60">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            New password
          </CardTitle>
          <CardDescription>
            Choose a new password for your account. The link expires after one
            hour.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="h-40 animate-pulse rounded-lg bg-muted" />
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
