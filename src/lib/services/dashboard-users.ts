import { apiFetch } from "@/lib/api/client";

type JsonRecord = Record<string, unknown>;

async function parseJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

export async function fetchDashboardUsers(params: URLSearchParams) {
  return apiFetch(`/api/dashboard/users?${params.toString()}`, { cache: "no-store" });
}

export async function fetchDashboardUserById(userId: string) {
  return apiFetch(`/api/dashboard/users/${userId}`, { cache: "no-store" });
}

export async function patchDashboardUser(userId: string, body: JsonRecord) {
  return apiFetch(`/api/dashboard/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function deleteDashboardUser(userId: string) {
  return apiFetch(`/api/dashboard/users/${userId}`, { method: "DELETE" });
}

export { parseJson };
