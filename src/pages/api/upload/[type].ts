import fs from "node:fs";
import path from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ALLOWED_TYPES = new Set([
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

const ALLOWED_FOLDERS = new Set(["images", "files", "content"]);

function slugPart(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function queryValue(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

function resolveUploadParts(req: { query: Record<string, unknown> }) {
  const rawType = queryValue(req.query.type);
  const rawFolder = queryValue(req.query.folder);
  const type = slugPart(rawType ?? "");
  const folder = slugPart(rawFolder ?? "images");
  if (!ALLOWED_TYPES.has(type)) {
    throw new Error("Invalid upload type.");
  }
  if (!ALLOWED_FOLDERS.has(folder)) {
    throw new Error("Invalid upload folder.");
  }
  return { type, folder };
}

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    try {
      const { type, folder } = resolveUploadParts(req);
      const target = path.join(process.cwd(), "public", type, folder);
      fs.mkdirSync(target, { recursive: true });
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

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

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
    const { type, folder } = resolveUploadParts(req);
    await runMiddleware(req, res);
    if (!req.file) {
      return res.status(400).json({ error: "Missing file" });
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
