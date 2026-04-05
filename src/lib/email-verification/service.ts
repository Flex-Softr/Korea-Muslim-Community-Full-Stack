import "server-only";

import { createHash, randomBytes } from "crypto";
import { env } from "@/config/env";
import { sendMail } from "@/lib/email/send-mail";
import { buildEmailVerificationEmail } from "@/lib/email/templates/email-verification";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function hashToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

function publicAppUrl(): string {
  const raw = env.AUTH_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  return raw;
}

function appName(): string {
  return env.APP_NAME?.trim() || "App";
}

export async function createAndSendEmailVerification(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  if (user.emailVerified) return;

  await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.emailVerificationToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
    },
  });

  const verifyUrl = `${publicAppUrl()}/api/auth/verify-email?token=${encodeURIComponent(rawToken)}`;
  const { subject, html, text } = buildEmailVerificationEmail({
    appName: appName(),
    verifyUrl,
  });

  try {
    await sendMail({ to: user.email, subject, html, text });
  } catch (err) {
    console.error("[email-verification] sendMail failed:", err);
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });
    throw err;
  }
}

export type VerifyEmailResult =
  | { ok: true }
  | { ok: false; error: string };

export async function verifyEmailWithToken(
  rawToken: string | null,
): Promise<VerifyEmailResult> {
  const trimmed = rawToken?.trim();
  if (!trimmed) {
    return { ok: false, error: "Missing verification token." };
  }

  const tokenHash = hashToken(trimmed);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.expiresAt.getTime() < Date.now()) {
    return {
      ok: false,
      error: "This link is invalid or has expired. Request a new verification email.",
    };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.deleteMany({
      where: { userId: record.userId },
    }),
  ]);

  return { ok: true };
}
