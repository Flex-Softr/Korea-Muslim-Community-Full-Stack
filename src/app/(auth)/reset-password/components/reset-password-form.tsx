"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // FIX: safe access (prevents TS error)
  const token = searchParams?.get("token") ?? null;

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!token?.trim()) {
      setError(
        "Invalid or missing reset link. Request a new reset from the login page."
      );
      return;
    }

    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token.trim(), password }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
    };

    setPending(false);

    if (!res.ok) {
      setError(data.error || "Could not reset password.");
      return;
    }

    router.push("/login?reset=success");
    router.refresh();
  }

  if (!token?.trim()) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">
          Invalid or missing reset link. Open the link from your email or
          request a new one.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/forgot-password"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Request new link
          </Link>
          {" · "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="reset-password">New password</Label>
        <PasswordInput
          id="reset-password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reset-confirm">Confirm password</Label>
        <PasswordInput
          id="reset-confirm"
          name="confirm"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Back to log in
        </Link>
      </p>
    </form>
  );
}



// "use client";

// import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { PasswordInput } from "@/components/ui/password-input";

// export function ResetPasswordForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const token = searchParams.get("token");

//   const [error, setError] = useState<string | null>(null);
//   const [pending, setPending] = useState(false);

//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setError(null);

//     if (!token?.trim()) {
//       setError("Invalid or missing reset link. Request a new reset from the login page.");
//       return;
//     }

//     const form = new FormData(e.currentTarget);
//     const password = String(form.get("password") || "");
//     const confirm = String(form.get("confirm") || "");

//     if (password !== confirm) {
//       setError("Passwords do not match.");
//       return;
//     }

//     setPending(true);

//     const res = await fetch("/api/auth/reset-password", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ token: token.trim(), password }),
//     });

//     const data = (await res.json().catch(() => ({}))) as { error?: string };

//     setPending(false);

//     if (!res.ok) {
//       setError(data.error || "Could not reset password.");
//       return;
//     }

//     router.push("/login?reset=success");
//     router.refresh();
//   }

//   if (!token?.trim()) {
//     return (
//       <div className="space-y-4">
//         <p className="text-sm text-destructive">
//           Invalid or missing reset link. Open the link from your email or request
//           a new one.
//         </p>
//         <p className="text-center text-sm text-muted-foreground">
//           <Link
//             href="/forgot-password"
//             className="font-medium text-primary underline-offset-4 hover:underline"
//           >
//             Request new link
//           </Link>
//           {" · "}
//           <Link
//             href="/login"
//             className="font-medium text-primary underline-offset-4 hover:underline"
//           >
//             Log in
//           </Link>
//         </p>
//       </div>
//     );
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="space-y-2">
//         <Label htmlFor="reset-password">New password</Label>
//         <PasswordInput
//           id="reset-password"
//           name="password"
//           autoComplete="new-password"
//           required
//           minLength={8}
//         />
//       </div>
//       <div className="space-y-2">
//         <Label htmlFor="reset-confirm">Confirm password</Label>
//         <PasswordInput
//           id="reset-confirm"
//           name="confirm"
//           autoComplete="new-password"
//           required
//           minLength={8}
//         />
//       </div>
//       {error ? (
//         <p className="text-sm text-destructive" role="alert">
//           {error}
//         </p>
//       ) : null}
//       <Button type="submit" className="w-full" size="lg" disabled={pending}>
//         {pending ? "Updating…" : "Update password"}
//       </Button>
//       <p className="text-center text-sm text-muted-foreground">
//         <Link
//           href="/login"
//           className="font-medium text-primary underline-offset-4 hover:underline"
//         >
//           Back to log in
//         </Link>
//       </p>
//     </form>
//   );
// }
