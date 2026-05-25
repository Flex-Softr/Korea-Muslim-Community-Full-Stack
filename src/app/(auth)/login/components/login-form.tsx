"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { loginWithCredentials } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

function safeCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = safeCallbackUrl(
    searchParams?.get("callbackUrl") ?? null
  );

  const resetOk = searchParams?.get("reset") === "success";
  const verifiedOk = searchParams?.get("verified") === "1";
  const verifyInvalid = searchParams?.get("verify") === "invalid";
  const verifyMessage = searchParams?.get("message") ?? null;

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);
    setPending(true);

    const form = new FormData(e.currentTarget);

    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    try {
      const result = await loginWithCredentials(
        email,
        password,
        searchParams?.get("callbackUrl") ?? null
      );

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>

        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="login-password">Password</Label>

          <Link
            href="/forgot-password"
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <PasswordInput
          id="login-password"
          name="password"
          autoComplete="current-password"
          required
        />
      </div>

      {verifiedOk ? (
        <p
          className="text-sm text-green-600 dark:text-green-500"
          role="status"
        >
          Email verified. Sign in to continue.
        </p>
      ) : null}

      {verifyInvalid ? (
        <p className="text-sm text-destructive" role="alert">
          {verifyMessage
            ? decodeURIComponent(verifyMessage)
            : "That verification link is invalid or expired."}
        </p>
      ) : null}

      {resetOk ? (
        <p className="text-sm text-muted-foreground" role="status">
          Password updated. You can sign in with your new password.
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Register
        </Link>
      </p>
    </form>
  );
}


// "use client";

// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useState } from "react";
// import { loginWithCredentials } from "@/app/(auth)/login/actions";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { PasswordInput } from "@/components/ui/password-input";

// function safeCallbackUrl(raw: string | null): string {
//   if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
//   return raw;
// }

// export function LoginForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));
//   const resetOk = searchParams.get("reset") === "success";
//   const verifiedOk = searchParams.get("verified") === "1";
//   const verifyInvalid = searchParams.get("verify") === "invalid";
//   const verifyMessage = searchParams.get("message");
//   const [error, setError] = useState<string | null>(null);
//   const [pending, setPending] = useState(false);

//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setError(null);
//     setPending(true);
//     const form = new FormData(e.currentTarget);
//     const email = String(form.get("email") || "");
//     const password = String(form.get("password") || "");

//     try {
//       const result = await loginWithCredentials(
//         email,
//         password,
//         searchParams.get("callbackUrl"),
//       );
//       if (!result.ok) {
//         setError(result.error);
//         return;
//       }
//       router.push(callbackUrl);
//       router.refresh();
//     } catch {
//       setError("Network error. Please try again.");
//     } finally {
//       setPending(false);
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="space-y-2">
//         <Label htmlFor="login-email">Email</Label>
//         <Input
//           id="login-email"
//           name="email"
//           type="email"
//           autoComplete="email"
//           required
//           className="h-10"
//         />
//       </div>
//       <div className="space-y-2">
//         <div className="flex items-center justify-between gap-2">
//           <Label htmlFor="login-password">Password</Label>
//           <Link
//             href="/forgot-password"
//             className="text-xs font-medium text-primary underline-offset-4 hover:underline"
//           >
//             Forgot password?
//           </Link>
//         </div>
//         <PasswordInput
//           id="login-password"
//           name="password"
//           autoComplete="current-password"
//           required
//         />
//       </div>
//       {verifiedOk ? (
//         <p className="text-sm text-green-600 dark:text-green-500" role="status">
//           Email verified. Sign in to continue.
//         </p>
//       ) : null}
//       {verifyInvalid ? (
//         <p className="text-sm text-destructive" role="alert">
//           {verifyMessage
//             ? decodeURIComponent(verifyMessage)
//             : "That verification link is invalid or expired."}
//         </p>
//       ) : null}
//       {resetOk ? (
//         <p className="text-sm text-muted-foreground" role="status">
//           Password updated. You can sign in with your new password.
//         </p>
//       ) : null}
//       {error ? (
//         <p className="text-sm text-destructive" role="alert">
//           {error}
//         </p>
//       ) : null}
//       <Button type="submit" className="w-full" size="lg" disabled={pending}>
//         {pending ? "Signing in…" : "Sign in"}
//       </Button>
//       <p className="text-center text-sm text-muted-foreground">
//         No account?{" "}
//         <Link
//           href="/register"
//           className="font-medium text-primary underline-offset-4 hover:underline"
//         >
//           Register
//         </Link>
//       </p>
//     </form>
//   );
// }
