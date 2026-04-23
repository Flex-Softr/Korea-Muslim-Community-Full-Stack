function readLangFromDocumentCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)lang=([^;]*)/);
  if (!match?.[1]) return null;
  return decodeURIComponent(match[1]);
}

function normalizeLang(raw: string | null | undefined): "bn" | "en" | "kr" {
  const value = raw?.trim().toLowerCase();
  if (value === "en") return "en";
  if (value === "kr" || value === "kor" || value === "ko") return "kr";
  return "bn";
}

async function readLangCookie(): Promise<string> {
  if (typeof window !== "undefined") {
    return normalizeLang(readLangFromDocumentCookie());
  }
  const { cookies } = await import("next/headers");
  const store = await cookies();
  return normalizeLang(store.get("lang")?.value);
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const lang = await readLangCookie();
  const headers = new Headers(init.headers ?? {});
  headers.set("Accept-Language", lang);
  return fetch(input, { ...init, headers });
}
