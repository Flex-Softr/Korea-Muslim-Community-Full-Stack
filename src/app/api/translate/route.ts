import { NextResponse } from "next/server";

type TranslateBody = {
  q?: string;
  source?: string;
  target?: string;
};

const CACHE = new Map<string, string>();

function normalizeLang(lang?: string): string {
  if (!lang) return "auto";
  if (lang === "kr" || lang === "kor") return "ko";
  return lang;
}

async function googleTranslate(
  text: string,
  source: string,
  target: string,
  timeoutMs = 7000,
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const url =
      `https://translate.googleapis.com/translate_a/single?client=gtx&dt=t` +
      `&sl=${encodeURIComponent(source)}&tl=${encodeURIComponent(target)}` +
      `&q=${encodeURIComponent(text)}`;
    const response = await fetch(url, { method: "GET", signal: controller.signal });
    if (!response.ok) return null;
    const data = (await response.json()) as unknown;
    if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
    const translated = (data[0] as unknown[])
      .map((chunk) => (Array.isArray(chunk) ? chunk[0] : ""))
      .filter((value): value is string => typeof value === "string")
      .join("")
      .trim();
    return translated || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function libreTranslate(
  text: string,
  source: string,
  target: string,
  timeoutMs = 7000,
): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source,
        target,
        format: "text",
      }),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { translatedText?: string };
    return data.translatedText?.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TranslateBody;
    const text = body.q?.trim() ?? "";
    const source = normalizeLang(body.source ?? "auto");
    const target = normalizeLang(body.target ?? "en");

    if (!text) {
      return NextResponse.json({ translatedText: "" });
    }

    const key = `${text}|${source}|${target}`;
    const cached = CACHE.get(key);
    if (cached) {
      return NextResponse.json({ translatedText: cached });
    }

    const translated =
      (await googleTranslate(text, source, target)) ??
      (await libreTranslate(text, source, target)) ??
      text;
    CACHE.set(key, translated);
    return NextResponse.json({ translatedText: translated });
  } catch {
    return NextResponse.json({ translatedText: "", error: "Invalid request" }, { status: 400 });
  }
}
