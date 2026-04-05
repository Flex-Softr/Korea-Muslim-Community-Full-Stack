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

export function hasMinimumRole(
  userRole: string | undefined | null,
  minimum: UserRole,
): boolean {
  if (!userRole || !isUserRole(userRole)) return false;
  return rank[userRole] >= rank[minimum];
}

export function hasAnyRole(
  userRole: string | undefined | null,
  allowed: readonly UserRole[],
): boolean {
  if (!userRole || !isUserRole(userRole)) return false;
  return allowed.includes(userRole);
}

export function parseUserRole(value: string | undefined | null): UserRole {
  if (value && isUserRole(value)) return value;
  return "USER";
}
