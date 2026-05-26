import fs from "node:fs";
import path from "node:path";

export const ALLOWED_UPLOAD_TYPES = new Set([
  "account",
  "activity",
  "article",
  "blog",
  "carousel",
  "download",
  "member",
  "misc",
  "news",
  "other-page",
  "photo",
  "profile",
  "video",
]);

export const ALLOWED_UPLOAD_FOLDERS = new Set(["images", "files", "content"]);

export function slugPart(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function queryValue(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

export function getUploadRoot(): string {
  return path.resolve(process.env.UPLOAD_DIR?.trim() || path.join(process.cwd(), "public"));
}

export function getPublicUploadRoot(): string {
  return path.resolve(process.cwd(), "public");
}

export function resolveUploadParts(rawType: unknown, rawFolder: unknown) {
  const type = slugPart(queryValue(rawType) ?? "");
  const folder = slugPart(queryValue(rawFolder) ?? "images");

  if (!ALLOWED_UPLOAD_TYPES.has(type)) {
    throw new Error("Invalid upload type.");
  }
  if (!ALLOWED_UPLOAD_FOLDERS.has(folder)) {
    throw new Error("Invalid upload folder.");
  }

  return { type, folder };
}

export function ensureUploadDirectory(type: string, folder: string): string {
  const target = path.join(getUploadRoot(), type, folder);
  fs.mkdirSync(target, { recursive: true });
  return target;
}

export function resolveUploadedFilePath(parts: string[], root = getUploadRoot()): string | null {
  if (parts.length < 3) return null;

  const [rawType, rawFolder, ...fileParts] = parts;
  const { type, folder } = resolveUploadParts(rawType, rawFolder);
  const safeFileParts = fileParts.map((part) => slugPart(part)).filter(Boolean);
  if (safeFileParts.length !== fileParts.length) return null;

  const uploadRoot = path.resolve(root);
  const filePath = path.resolve(uploadRoot, type, folder, ...safeFileParts);
  const relativePath = path.relative(uploadRoot, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return filePath;
}

export function contentTypeForFile(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".pdf":
      return "application/pdf";
    case ".doc":
      return "application/msword";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".xls":
      return "application/vnd.ms-excel";
    case ".xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    default:
      return "application/octet-stream";
  }
}
