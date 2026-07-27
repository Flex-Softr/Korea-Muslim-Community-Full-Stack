import { apiFetch } from "@/lib/api/client";

export type VisitorByCountry = {
  country: string;
  countryId: string;
  activeUsers: number;
};

type VisitorHistoryResponse = {
  status: number;
  message: string;
  data?: VisitorByCountry[];
};

export async function fetchVisitorHistory(): Promise<VisitorByCountry[]> {
  try {
    const res = await apiFetch("/api/visitor-history", { cache: "no-store" });
    if (!res.ok) {
      return [];
    }
    const json = (await res.json()) as VisitorHistoryResponse;
    if (!Array.isArray(json.data)) {
      return [];
    }
    return json.data;
  } catch (error) {
    console.error("[visitor-history] fetch failed", error);
    return [];
  }
}
