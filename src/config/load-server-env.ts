import { z } from "zod";

const emptyToUndef = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const serverEnvSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
    AUTH_URL: z.preprocess(
      emptyToUndef,
      z.string().url("AUTH_URL must be a valid URL when set").optional(),
    ),
    SEED_USER_EMAIL: z.preprocess(
      emptyToUndef,
      z.string().email("SEED_USER_EMAIL must be a valid email when set").optional(),
    ),
    SEED_USER_PASSWORD: z.preprocess(
      emptyToUndef,
      z
        .string()
        .min(8, "SEED_USER_PASSWORD must be at least 8 characters when set")
        .optional(),
    ),
    SEED_USER_NAME: z.preprocess(emptyToUndef, z.string().optional()),
    SEED_USER_ROLE: z.preprocess(
      emptyToUndef,
      z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
    ),
    /** Comma-separated emails always treated as SUPER_ADMIN (upgrade-only). */
    SUPER_ADMIN_EMAILS: z.preprocess(emptyToUndef, z.string().optional()),
    /** Comma-separated emails always treated as ADMIN (upgrade-only). */
    ADMIN_EMAILS: z.preprocess(emptyToUndef, z.string().optional()),
    APP_NAME: z.preprocess(emptyToUndef, z.string().max(120).optional()),
    EMAIL_FROM: z.preprocess(emptyToUndef, z.string().min(1).optional()),
    SMTP_HOST: z.preprocess(emptyToUndef, z.string().min(1).optional()),
    SMTP_PORT: z.preprocess((v) => {
      if (v === undefined || v === "") return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    }, z.number().int().positive().optional()),
    SMTP_USER: z.preprocess(emptyToUndef, z.string().optional()),
    SMTP_PASSWORD: z.preprocess(emptyToUndef, z.string().optional()),
    CONTACT_TO_EMAIL: z.preprocess(
      emptyToUndef,
      z.string().email("CONTACT_TO_EMAIL must be valid when set").optional(),
    ),
  })
  .superRefine((data, ctx) => {
    const hasEmail = Boolean(data.SEED_USER_EMAIL);
    const hasPassword = Boolean(data.SEED_USER_PASSWORD);
    if (hasEmail !== hasPassword) {
      ctx.addIssue({
        code: "custom",
        message:
          "Set both SEED_USER_EMAIL and SEED_USER_PASSWORD, or omit both.",
        path: ["SEED_USER_EMAIL"],
      });
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Use from Prisma seed, scripts, and tests (no `server-only`). For the app, prefer `@/config/env`. */
export function loadServerEnv(): ServerEnv {
  const isBuild = process.env.SKIP_ENV_VALIDATION === "1";

  const envData = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    SEED_USER_EMAIL: process.env.SEED_USER_EMAIL,
    SEED_USER_PASSWORD: process.env.SEED_USER_PASSWORD,
    SEED_USER_NAME: process.env.SEED_USER_NAME,
    SEED_USER_ROLE: process.env.SEED_USER_ROLE,
    SUPER_ADMIN_EMAILS: process.env.SUPER_ADMIN_EMAILS,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    APP_NAME: process.env.APP_NAME,
    EMAIL_FROM: process.env.EMAIL_FROM,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
  };

  if (isBuild) {
    return envData as ServerEnv;
  }

  return serverEnvSchema.parse(envData);
}
