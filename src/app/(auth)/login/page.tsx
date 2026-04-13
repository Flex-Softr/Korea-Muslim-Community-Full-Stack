import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteLogoMark } from "@/components/layout/site-logo-mark";
import { LoginForm } from "./components/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="shadow-lg ring-1 ring-border/60">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <div className="mb-2 flex justify-center sm:justify-start">
            <SiteLogoMark className="h-16 w-16 sm:h-16 sm:w-16" priority />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Log in
          </CardTitle>
          <CardDescription>
            One account for the site and the dashboard. If you were sent here
            from a protected page, you will return there after signing in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="h-52 animate-pulse rounded-lg bg-muted" />
            }
          >
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
