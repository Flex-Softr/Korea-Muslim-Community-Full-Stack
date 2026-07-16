import path from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import multer from "multer";
import { ensureUploadDirectory, resolveUploadParts, slugPart } from "@/lib/uploads";

export const config = {
  api: {
    bodyParser: false,
  },
};

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    try {
      const { type, folder } = resolveUploadParts(req.query.type, req.query.folder);
      const target = ensureUploadDirectory(type, folder);
      cb(null, target);
    } catch (error) {
      cb(error as Error, "");
    }
  },
  filename(_req, file, cb) {
    const ext = slugPart(path.extname(file.originalname).toLowerCase()) || "";
    const base = slugPart(path.basename(file.originalname, path.extname(file.originalname))) || "upload";
    cb(null, `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext ? `.${ext.replace(/^\./, "")}` : ""}`);
  },
});

const PUBLIC_UPLOAD_TYPES = new Set(["account", "profile"]);

const ALLOWED_FILE_MIME_TYPES = new Set([
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  // PDF
  "application/pdf",
  // Word
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // PowerPoint
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // ZIP / compressed archives
  "application/zip",
  "application/x-zip-compressed",
  "application/x-zip",
  "application/octet-stream",
]);

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    try {
      const { folder } = resolveUploadParts(req.query.type, req.query.folder);
      if (folder === "images" || folder === "content") {
        cb(null, file.mimetype.startsWith("image/"));
        return;
      }
      // For the "files" folder: allow images + all document/archive types
      cb(null, file.mimetype.startsWith("image/") || ALLOWED_FILE_MIME_TYPES.has(file.mimetype));
    } catch (error) {
      cb(error as Error);
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

function shouldUseSecureAuthCookie() {
  const authUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL;
  if (authUrl) return authUrl.startsWith("https://");
  return process.env.NODE_ENV === "production";
}

async function hasUploadSession(req: NextApiRequest) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) return false;
  const token = await getToken({
    req: { headers: req.headers as Record<string, string> },
    secret,
    secureCookie: shouldUseSecureAuthCookie(),
  });
  return Boolean(token?.sub);
}

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const middleware = upload.single("file");
    middleware(
      req as unknown as Parameters<typeof middleware>[0],
      res as unknown as Parameters<typeof middleware>[1],
      (result) => {
        if (result) reject(result);
        else resolve();
      },
    );
  });
}

type UploadedRequest = NextApiRequest & {
  file?: Express.Multer.File;
};

export default async function handler(req: UploadedRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { type, folder } = resolveUploadParts(req.query.type, req.query.folder);
    if (!PUBLIC_UPLOAD_TYPES.has(type)) {
      const hasSession = await hasUploadSession(req);
      if (!hasSession) {
        return res.status(401).json({ error: "Unauthorized" });
      }
    }
    await runMiddleware(req, res);
    if (!req.file) {
      return res.status(400).json({ error: "Missing file or unsupported file type" });
    }
    return res.status(201).json({
      url: `/${type}/${folder}/${req.file.filename}`,
      fileName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return res.status(400).json({ error: message });
  }
}
