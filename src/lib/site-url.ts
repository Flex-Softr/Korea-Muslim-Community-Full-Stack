/**
 * Canonical site origin for sitemap, robots, and absolute links.
 * Prefer NEXT_PUBLIC_APP_URL, then AUTH_URL, for server/build contexts.
 */
export function getSiteOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.AUTH_URL?.trim() ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}
