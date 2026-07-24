export const USER_ROLES = ["USER", "ADMIN", "SUPER_ADMIN"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}

/** Display labels for UI */
export const ROLE_LABELS: Record<UserRole, string> = {
  USER: "User",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super admin",
};

const rank: Record<UserRole, number> = {
  USER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
};

/** Normalize common aliases / casing to a canonical role, or null if unrecognized. */
export function normalizeRoleString(
  value: string | undefined | null,
): UserRole | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  if (isUserRole(trimmed)) return trimmed;

  const underscored = trimmed.toUpperCase().replace(/[\s-]+/g, "_");
  if (isUserRole(underscored)) return underscored;

  const compact = trimmed.toLowerCase().replace(/[\s_-]+/g, "");
  if (compact === "superadmin") return "SUPER_ADMIN";
  if (compact === "admin") return "ADMIN";
  if (compact === "user") return "USER";
  return null;
}

export function roleRank(role: UserRole): number {
  return rank[role];
}

export function higherRole(a: UserRole, b: UserRole): UserRole {
  return rank[a] >= rank[b] ? a : b;
}

export function hasMinimumRole(
  userRole: string | undefined | null,
  minimum: UserRole,
): boolean {
  const role = normalizeRoleString(userRole);
  if (!role) return false;
  return rank[role] >= rank[minimum];
}

export function hasAnyRole(
  userRole: string | undefined | null,
  allowed: readonly UserRole[],
): boolean {
  const role = normalizeRoleString(userRole);
  if (!role) return false;
  return allowed.includes(role);
}

export function parseUserRole(value: string | undefined | null): UserRole {
  return normalizeRoleString(value) ?? "USER";
}
