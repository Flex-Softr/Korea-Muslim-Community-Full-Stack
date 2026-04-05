import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ForgotPasswordForm } from "./components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="shadow-lg ring-1 ring-border/60">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Forgot password
          </CardTitle>
          <CardDescription>
            Enter your email and we will send a reset link if an account exists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
