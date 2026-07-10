import fs from "node:fs";
import path from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  contentTypeForFile,
  getPublicUploadRoot,
  getUploadRoot,
  resolveUploadParts,
  resolveUploadedFilePath,
} from "@/lib/uploads";

const FALLBACK_IMAGE_PATH = path.join(getPublicUploadRoot(), "brand", "logo.png");

function canUseImageFallback(parts: string[]) {
  if (parts.length < 3) return false;
  try {
    const { folder } = resolveUploadParts(parts[0], parts[1]);
    return folder === "images" || folder === "content";
  } catch {
    return false;
  }
}

function streamFile(req: NextApiRequest, res: NextApiResponse, filePath: string, cacheControl: string) {
  const stat = fs.statSync(filePath);
  if (!stat.isFile()) {
    return res.status(404).json({ error: "File not found" });
  }

  res.setHeader("Content-Type", contentTypeForFile(filePath));
  res.setHeader("Content-Length", stat.size.toString());
  res.setHeader("Cache-Control", cacheControl);

  if (req.method === "HEAD") {
    return res.status(200).end();
  }

  return fs.createReadStream(filePath).pipe(res);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parts = Array.isArray(req.query.path) ? req.query.path : [];
  let filePath = resolveUploadedFilePath(parts);

  if (filePath && !fs.existsSync(filePath) && getUploadRoot() !== getPublicUploadRoot()) {
    filePath = resolveUploadedFilePath(parts, getPublicUploadRoot());
  }

  if (!filePath || !fs.existsSync(filePath)) {
    if (canUseImageFallback(parts) && fs.existsSync(FALLBACK_IMAGE_PATH)) {
      return streamFile(req, res, FALLBACK_IMAGE_PATH, "public, max-age=300, must-revalidate");
    }
    return res.status(404).json({ error: "File not found" });
  }

  return streamFile(req, res, filePath, "public, max-age=0, must-revalidate");
}
