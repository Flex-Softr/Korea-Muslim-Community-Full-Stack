import { apiFetch } from "@/lib/api/client";

export type UserDetail = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: "pending" | "active" | "suspended";
  createdAt: string;
  updatedAt: string;
  profile: {
    aboutSummary: string | null;
    bio: string | null;
    imageUrl: string | null;
  } | null;
  submittedBlogs: Array<{
    id: string;
    title: string;
    category: string;
    dateIso: string;
  }>;
};

async function parseError(res: Response, fallback: string): Promise<string> {
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  return data.error ?? fallback;
}

export async function getDashboardUserById(id: string): Promise<UserDetail> {
  const res = await apiFetch(`/api/dashboard/users/${id}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(await parseError(res, "Could not load user details."));
  }
  return (await res.json()) as UserDetail;
}

export async function updateDashboardUser(
  id: string,
  body: Record<string, unknown>,
): Promise<void> {
  const res = await apiFetch(`/api/dashboard/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await parseError(res, "Could not update user."));
  }
}

export async function deleteDashboardUser(id: string): Promise<void> {
  const res = await apiFetch(`/api/dashboard/users/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(await parseError(res, "Could not delete user."));
  }
}
