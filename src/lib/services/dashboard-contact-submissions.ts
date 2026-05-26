import { apiFetch } from "@/lib/api/client";

export async function fetchDashboardContactSubmissions(
  params: URLSearchParams,
) {
  return apiFetch(
    `/api/dashboard/contact-submissions?${params.toString()}`,
    { cache: "no-store" },
  );
}

export async function deleteDashboardContactSubmission(submissionId: string) {
  return apiFetch(`/api/dashboard/contact-submissions/${submissionId}`, {
    method: "DELETE",
  });
}
