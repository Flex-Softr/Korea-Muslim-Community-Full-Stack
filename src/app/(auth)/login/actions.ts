"use server";

import { signIn } from "@/auth";
import { CredentialsSignin } from "next-auth";

function safeCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export type LoginResult =
  | { ok: true }
  | { ok: false; error: string };

export async function loginWithCredentials(
  email: string,
  password: string,
  callbackUrlRaw: string | null,
): Promise<LoginResult> {
  const callbackUrl = safeCallbackUrl(callbackUrlRaw);
  const trimmed = email.trim();
  if (!trimmed || !password) {
    return { ok: false, error: "Invalid email or password." };
  }

  try {
    await signIn("credentials", {
      email: trimmed,
      password,
      redirect: false,
      redirectTo: callbackUrl,
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof CredentialsSignin) {
      return { ok: false, error: "Invalid email or password." };
    }
    console.error(err);
    return {
      ok: false,
      error: "Something went wrong. Please try again.",
    };
  }
}
