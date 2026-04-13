import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteLogoMark } from "@/components/layout/site-logo-mark";
import { RegisterForm } from "./components/register-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card className="shadow-lg ring-1 ring-border/60">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <div className="mb-2 flex justify-center sm:justify-start">
            <SiteLogoMark className="h-16 w-16 sm:h-16 sm:w-16" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Association Registration
          </CardTitle>
          <CardDescription>
            Complete all required steps. Your account will stay pending until admin approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
