import { auth } from "@/auth";
import { hasAnyRole, type UserRole } from "@/lib/roles";
import { redirect } from "next/navigation";

export async function getSession() {
  return auth();
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session;
}

/**
 * Redirects to `/dashboard` if the user lacks one of the allowed roles.
 */
export async function requireRoles(allowed: UserRole[]) {
  const session = await requireUser();
  const role = session.user.role;
  if (!hasAnyRole(role, allowed)) {
    redirect("/dashboard");
  }
  return session;
}

export async function requireAdminOrAbove() {
  return requireRoles(["ADMIN", "SUPER_ADMIN"]);
}

export async function requireSuperAdmin() {
  return requireRoles(["SUPER_ADMIN"]);
}
