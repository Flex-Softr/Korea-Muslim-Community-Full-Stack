import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripHtmlTags(value: string) {
  const danda = String.fromCharCode(0x0964)
  // Regular spaces after danda (।) collapse in Bangla fonts; NBSP keeps a visible gap.
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(new RegExp(`${danda}\\s*`, "g"), `${danda}\u00A0\u00A0`)
}

export function cleanHtml(html: string): string {
  if (!html) return "";
  // Strip <style>...</style> tags to prevent global styles leakage
  let cleaned = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");
  // Strip <script>...</script> tags for security
  cleaned = cleaned.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
  return cleaned;
}
