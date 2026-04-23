import type { Lang } from "@/components/providers/language-provider";

const translationCache = new Map<string, string>();
const detectionCache = new Map<string, string>();
const inFlightTranslations = new Map<string, Promise<string>>();

function cacheKey(text: string, sourceLang: string, targetLang: string): string {
  return `${text}|${sourceLang}|${targetLang}`;
}

function toApiLang(lang: string): string {
  if (lang === "kr" || lang === "kor") return "ko";
  return lang;
}

async function providerTranslate(
  text: string,
  sourceLang: string,
  targetLang: string,
  timeoutMs = 5000,
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: "text",
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { translatedText?: string };
    return data.translatedText?.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function googleTranslate(
  text: string,
  sourceLang: string,
  targetLang: string,
  timeoutMs = 5000,
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const source = sourceLang === "auto" ? "auto" : sourceLang;
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t` +
      `&sl=${encodeURIComponent(source)}&tl=${encodeURIComponent(targetLang)}` +
      `&q=${encodeURIComponent(text)}`;
    const res = await fetch(url, { method: "GET", signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
    const segments = (data[0] as unknown[])
      .map((entry) => (Array.isArray(entry) ? entry[0] : ""))
      .filter((entry): entry is string => typeof entry === "string");
    const translated = segments.join("").trim();
    return translated || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function apiRouteTranslate(
  text: string,
  sourceLang: string,
  targetLang: string,
  timeoutMs = 7000,
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { translatedText?: string };
    return data.translatedText?.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function detectLanguage(text: string): Promise<string | null> {
  if (!text.trim()) return null;
  if (detectionCache.has(text)) return detectionCache.get(text) ?? null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch("https://libretranslate.de/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text }),
      signal: controller.signal,
    });
    const data = (await res.json()) as Array<{ language: string }>;
    const detected = data?.[0]?.language ?? null;
    if (detected) detectionCache.set(text, detected);
    return detected;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function translateText(
  text: string,
  targetLang: Lang,
  sourceLang = "auto",
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const target = toApiLang(targetLang);
  const source = toApiLang(sourceLang);
  if (source !== "auto" && source === target) return text;
  const cacheId = cacheKey(trimmed, source, target);
  const cached = translationCache.get(cacheId);
  if (cached) return cached;
  const pending = inFlightTranslations.get(cacheId);
  if (pending) return pending;

  const request = (async () => {
    try {
      const translated =
        typeof window !== "undefined"
          ? (await apiRouteTranslate(trimmed, source, target)) ??
            (await googleTranslate(trimmed, source, target)) ??
            (await providerTranslate(trimmed, source, target))
          : (await providerTranslate(trimmed, source, target)) ??
            (await googleTranslate(trimmed, source, target));
      if (!translated) return text;
      translationCache.set(cacheId, translated);
      return translated;
    } catch {
      return text;
    } finally {
      inFlightTranslations.delete(cacheId);
    }
  })();
  inFlightTranslations.set(cacheId, request);
  return request;
}

export function clearTranslationCache() {
  translationCache.clear();
  detectionCache.clear();
  inFlightTranslations.clear();
}

export function clearCacheForLanguage(targetLang: Lang) {
  const target = toApiLang(targetLang);
  for (const key of translationCache.keys()) {
    if (key.endsWith(`|${target}`)) {
      translationCache.delete(key);
    }
  }
}
