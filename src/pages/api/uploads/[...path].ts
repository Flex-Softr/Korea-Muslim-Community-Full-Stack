import fs from "node:fs";
import type { NextApiRequest, NextApiResponse } from "next";
import { contentTypeForFile, getPublicUploadRoot, getUploadRoot, resolveUploadedFilePath } from "@/lib/uploads";

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
    return res.status(404).json({ error: "File not found" });
  }

  const stat = fs.statSync(filePath);
  if (!stat.isFile()) {
    return res.status(404).json({ error: "File not found" });
  }

  res.setHeader("Content-Type", contentTypeForFile(filePath));
  res.setHeader("Content-Length", stat.size.toString());
  res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");

  if (req.method === "HEAD") {
    return res.status(200).end();
  }

  return fs.createReadStream(filePath).pipe(res);
}
