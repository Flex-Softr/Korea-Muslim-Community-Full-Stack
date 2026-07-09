import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stripHtmlTags(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

export function cleanHtml(html: string): string {
  if (!html) return "";
  // Strip <style>...</style> tags to prevent global styles leakage
  let cleaned = html.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");
  // Strip <script>...</script> tags for security
  cleaned = cleaned.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
  return cleaned;
}
