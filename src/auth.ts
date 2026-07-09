import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { authConfig } from "@/auth.config";
import { parseUserRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

async function resolveProfileImage(email: string | null | undefined) {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    return undefined;
  }

  const member = await prisma.communityMember.findFirst({
    where: { contactEmail: normalizedEmail },
    select: { imageUrl: true },
  });
  const imageUrl = member?.imageUrl?.trim();
  return imageUrl || undefined;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email?.trim() || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email: email.trim().toLowerCase() },
        });
        if (!user) return null;
        if (!user.emailVerified) return null;

        const valid = await compare(password, user.password);
        if (!valid) return null;

        const role = parseUserRole(user.role);

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: await resolveProfileImage(user.email),
          role,
          emailVerified: user.emailVerified != null,
        };
      },
    }),
  ],
});
