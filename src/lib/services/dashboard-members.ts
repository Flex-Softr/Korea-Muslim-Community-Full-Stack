import { apiFetch } from "@/lib/api/client";

type JsonRecord = Record<string, unknown>;

export async function fetchDashboardMembers(params: URLSearchParams) {
  return apiFetch(`/api/dashboard/members?${params.toString()}`, { cache: "no-store" });
}

export async function fetchDashboardMemberById(memberId: string) {
  return apiFetch(`/api/dashboard/members/${memberId}`, { cache: "no-store" });
}

export async function createDashboardMember(body: JsonRecord) {
  return apiFetch("/api/dashboard/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function patchDashboardMember(memberId: string, body: JsonRecord) {
  return apiFetch(`/api/dashboard/members/${memberId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function deleteDashboardMember(memberId: string) {
  return apiFetch(`/api/dashboard/members/${memberId}`, { method: "DELETE" });
}
