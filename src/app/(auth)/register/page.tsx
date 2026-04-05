import { RegisterForm } from "./components/register-form";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md">
      <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight">
        Create account
      </h1>
      <p className="mb-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Stored in SQLite via Prisma — swap for your production database.
      </p>
      <RegisterForm />
    </div>
  );
}
