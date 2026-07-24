import "server-only";

import { prisma } from "@/lib/prisma";
import {
  higherRole,
  parseUserRole,
  type UserRole,
} from "@/lib/roles";

function parseEmailList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Env-configured privileged role for an email (if any).
 * - SUPER_ADMIN_EMAILS → SUPER_ADMIN
 * - ADMIN_EMAILS → ADMIN
 * - SEED_USER_EMAIL (+ SEED_USER_ROLE, default ADMIN) → that role when not USER
 */
export function privilegedRoleForEmail(
  email: string | undefined | null,
): UserRole | null {
  if (!email?.trim()) return null;
  const normalized = email.trim().toLowerCase();

  if (parseEmailList(process.env.SUPER_ADMIN_EMAILS).includes(normalized)) {
    return "SUPER_ADMIN";
  }
  if (parseEmailList(process.env.ADMIN_EMAILS).includes(normalized)) {
    return "ADMIN";
  }

  const seedEmail = process.env.SEED_USER_EMAIL?.trim().toLowerCase();
  if (seedEmail && seedEmail === normalized) {
    const seedRole = process.env.SEED_USER_ROLE
      ? parseUserRole(process.env.SEED_USER_ROLE)
      : "ADMIN";
    return seedRole === "USER" ? null : seedRole;
  }

  return null;
}

export function resolveEffectiveRole(
  email: string | undefined | null,
  storedRole: string | undefined | null,
): UserRole {
  const stored = parseUserRole(storedRole);
  const privileged = privilegedRoleForEmail(email);
  if (!privileged) return stored;
  return higherRole(stored, privileged);
}

/**
 * Ensure DB role matches env privilege for this email (upgrade only, never demote).
 * Returns the effective role after any update.
 */
export async function ensurePrivilegedDbRole(
  userId: string,
  email: string,
  storedRole: string | undefined | null,
): Promise<UserRole> {
  const effective = resolveEffectiveRole(email, storedRole);
  const stored = parseUserRole(storedRole);
  if (effective === stored) return effective;

  await prisma.user.update({
    where: { id: userId },
    data: { role: effective },
  });
  return effective;
}
