import "server-only";

import type { Lang } from "@/lib/i18n/lang";

/**
 * Translates user-authored content when a provider is configured.
 *
 * The current project only ships static UI translation bundles. Until a content
 * translation provider is added, preserve authored text instead of making
 * build/runtime rendering depend on an external network service.
 */
export async function translateText(
  text: string,
  targetLang: Lang,
  sourceLang: Lang = "en",
): Promise<string> {
  const value = text.trim();
  if (!value || targetLang === sourceLang) return text;

  return text;
}
