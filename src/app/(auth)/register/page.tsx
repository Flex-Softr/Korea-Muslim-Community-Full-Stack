import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RegisterForm } from "./components/register-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="shadow-lg ring-1 ring-border/60">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Create account
          </CardTitle>
          <CardDescription>
            Stored in SQLite via Prisma — swap for your production database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
