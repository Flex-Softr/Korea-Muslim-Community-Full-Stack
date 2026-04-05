/**
 * Role checks without importing `@prisma/client` — safe for Edge (middleware).
 */
export type RoleSlug = "USER" | "ADMIN" | "SUPER_ADMIN";

const rank: Record<RoleSlug, number> = {
  USER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
};

export function roleAtLeast(
  role: string | undefined,
  minimum: RoleSlug,
): boolean {
  if (!role || !(role in rank)) return false;
  return rank[role as RoleSlug] >= rank[minimum];
}

export function roleIsOneOf(
  role: string | undefined,
  allowed: readonly RoleSlug[],
): boolean {
  if (!role) return false;
  return (allowed as string[]).includes(role);
}
