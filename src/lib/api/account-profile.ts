import type {
  AccountProfileResponse,
  AccountProfileUpdatePayload,
} from "@/lib/account/profile-types";
import { apiFetch } from "@/lib/api/client";

export async function getAccountProfile(): Promise<AccountProfileResponse> {
  const res = await apiFetch("/api/account/profile", { cache: "no-store" });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
  } & Partial<AccountProfileResponse>;
  if (!res.ok) {
    throw new Error(data.error || "Could not load profile.");
  }
  if (!data.user) {
    throw new Error("Invalid profile response.");
  }
  return data as AccountProfileResponse;
}

export async function updateAccountProfile(
  body: AccountProfileUpdatePayload,
): Promise<{ ok: true }> {
  const res = await apiFetch("/api/account/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new Error(data.error || "Could not update profile.");
  }
  return { ok: true };
}
