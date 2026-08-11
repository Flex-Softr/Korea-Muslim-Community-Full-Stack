export type DownloadFileSource = "upload" | "external";

export function isExternalHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeDownloadFileSource(
  source: string | null | undefined,
  fileUrl: string | null | undefined,
): DownloadFileSource {
  if (source === "external" || source === "upload") return source;
  if (fileUrl && isExternalHttpUrl(fileUrl)) return "external";
  return "upload";
}

export function validateDownloadFileUrl(
  fileUrl: string,
  fileSource: DownloadFileSource,
): string | null {
  const trimmed = fileUrl.trim();
  if (!trimmed) return "File is required";
  if (fileSource === "external") {
    if (!isExternalHttpUrl(trimmed)) {
      return "Enter a valid direct file URL (http or https)";
    }
  }
  return null;
}
