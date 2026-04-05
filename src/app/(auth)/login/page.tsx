import { Suspense } from "react";
import { LoginForm } from "./components/login-form";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight">
        Log in
      </h1>
      <p className="mb-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Same sign-in for the site and the dashboard. You will be sent back to
        where you started when a link required authentication.
      </p>
      <Suspense
        fallback={
          <div className="h-48 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
