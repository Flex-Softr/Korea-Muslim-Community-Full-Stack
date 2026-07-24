/**
 * Role checks without importing `@prisma/client` — safe for Edge (middleware).
 */
export type RoleSlug = "USER" | "ADMIN" | "SUPER_ADMIN";

const RANK: Record<RoleSlug, number> = {
  USER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
};

function normalizeRole(role: string | undefined | null): RoleSlug | null {
  if (!role?.trim()) return null;
  const trimmed = role.trim();
  if (trimmed in RANK) return trimmed as RoleSlug;

  const underscored = trimmed.toUpperCase().replace(/[\s-]+/g, "_");
  if (underscored in RANK) return underscored as RoleSlug;

  const compact = trimmed.toLowerCase().replace(/[\s_-]+/g, "");
  if (compact === "superadmin") return "SUPER_ADMIN";
  if (compact === "admin") return "ADMIN";
  if (compact === "user") return "USER";
  return null;
}

export function roleAtLeast(
  role: string | undefined,
  minimum: RoleSlug,
): boolean {
  const normalized = normalizeRole(role);
  if (!normalized) return false;
  return RANK[normalized] >= RANK[minimum];
}

export function roleIsOneOf(
  role: string | undefined,
  allowed: readonly RoleSlug[],
): boolean {
  const normalized = normalizeRole(role);
  if (!normalized) return false;
  return allowed.includes(normalized);
}
