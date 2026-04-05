"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PendingVerifyContent({ email }: { email: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function resend() {
    setError(null);
    setMessage(null);
    setPending(true);
    const res = await fetch("/api/auth/resend-verification", { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Could not resend.");
      return;
    }
    setMessage(data.message || "Check your inbox.");
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="shadow-lg ring-1 ring-border/60">
        <CardHeader className="space-y-1 text-center sm:text-left">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Verify your email
          </CardTitle>
          <CardDescription>
            We sent a link to <span className="font-medium">{email}</span>.
            Open it to unlock the dashboard. The link expires in 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message ? (
            <p className="text-sm text-muted-foreground" role="status">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant="default"
              className="w-full sm:w-auto"
              disabled={pending}
              onClick={() => void resend()}
            >
              {pending ? "Sending…" : "Resend verification email"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => void signOut({ callbackUrl: "/login" })}
            >
              Sign out
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Back to home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
