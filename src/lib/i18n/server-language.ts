import type { Lang } from "@/lib/i18n/lang";

function normalizeLang(raw: string | null | undefined): Lang {
  if (!raw) return "bn";
  const value = raw.toLowerCase().trim().split("-")[0] ?? "";
  if (value === "en") return "en";
  if (value === "bn" || value === "bd") return "bn";
  if (value === "ko" || value === "kr" || value === "kor") return "ko";
  return "bn";
}

export async function getRequestLang(): Promise<Lang> {
  const { cookies, headers } = await import("next/headers");
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("lang")?.value;
  if (cookieLang) return normalizeLang(cookieLang);

  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language");
  const first = acceptLanguage?.split(",")[0];
  return normalizeLang(first);
}
