import "server-only";

import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { parseUserRole, type UserRole } from "@/lib/roles";

export type AuthenticatedCredentialsUser = {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: UserRole;
  emailVerified: boolean;
};

export type CredentialsAuthResult =
  | { ok: true; user: AuthenticatedCredentialsUser }
  | { ok: false; reason: "invalid" | "unverified" };

async function resolveProfileImage(email: string): Promise<string | undefined> {
  const member = await prisma.communityMember.findFirst({
    where: { contactEmail: email },
    select: { imageUrl: true },
  });
  const imageUrl = member?.imageUrl?.trim();
  return imageUrl || undefined;
}

export async function authenticateCredentials(
  email: string | undefined,
  password: string | undefined,
): Promise<CredentialsAuthResult> {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { ok: false, reason: "invalid" };
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      name: true,
      password: true,
      role: true,
    },
  });

  if (!user) {
    return { ok: false, reason: "invalid" };
  }

  const valid = await compare(password, user.password);
  if (!valid) {
    return { ok: false, reason: "invalid" };
  }

  if (!user.emailVerified) {
    return { ok: false, reason: "unverified" };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      image: await resolveProfileImage(user.email),
      role: parseUserRole(user.role),
      emailVerified: true,
    },
  };
}
