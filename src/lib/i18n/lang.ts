export type Lang = "en" | "bn" | "ko";

/** For `?lang=` on API routes — invalid values return `undefined` (caller falls back to cookie). */
export function parseLangQueryParam(raw: string | null | undefined): Lang | undefined {
  if (raw == null || raw === "") return undefined;
  const v = raw.toLowerCase().trim().split("-")[0] ?? "";
  if (v === "en") return "en";
  if (v === "ko" || v === "kr" || v === "kor") return "ko";
  if (v === "bn" || v === "bd") return "bn";
  return undefined;
}
