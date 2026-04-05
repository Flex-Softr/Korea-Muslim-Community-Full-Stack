import "server-only";

import { createHash, randomBytes } from "crypto";
import { hash } from "bcryptjs";
import { env } from "@/config/env";
import { sendMail } from "@/lib/email/send-mail";
import { buildPasswordResetEmail } from "@/lib/email/templates/password-reset";
import { prisma } from "@/lib/prisma";

const TOKEN_TTL_MS = 60 * 60 * 1000;

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

/**
 * Creates a reset token and sends email if the user exists.
 * Always treat as success at the API layer (no email enumeration).
 */
export async function createPasswordResetForEmail(
  email: string,
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return;

  const user = await prisma.user.findUnique({
    where: { email: normalized },
  });
  if (!user) return;

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
    },
  });

  const resetUrl = `${publicAppUrl()}/reset-password?token=${rawToken}`;
  const { subject, html, text } = buildPasswordResetEmail({
    appName: appName(),
    resetUrl,
  });

  try {
    await sendMail({ to: user.email, subject, html, text });
  } catch (err) {
    console.error("[password-reset] sendMail failed:", err);
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
  }
}

export type ResetPasswordResult =
  | { ok: true }
  | { ok: false; error: string };

export async function resetPasswordWithToken(
  rawToken: string,
  newPassword: string,
): Promise<ResetPasswordResult> {
  const trimmed = rawToken?.trim();
  if (!trimmed) {
    return { ok: false, error: "Missing reset token." };
  }

  if (!newPassword || newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const tokenHash = hashToken(trimmed);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.expiresAt.getTime() < Date.now()) {
    return {
      ok: false,
      error: "This link is invalid or has expired. Request a new reset.",
    };
  }

  const passwordHash = await hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: passwordHash },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: record.userId },
    }),
  ]);

  return { ok: true };
}
