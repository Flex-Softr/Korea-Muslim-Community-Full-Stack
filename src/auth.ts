import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { env } from "@/config/env";
import { parseUserRole, type UserRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

/** Re-sync role/verification/name from DB periodically for JWT sessions. */
const SESSION_SYNC_MS = 15 * 60 * 1000;

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
  trustHost: true,
  secret: env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
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
          role,
          emailVerified: user.emailVerified != null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id;
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
        token.role = user.role as UserRole;
        token.emailVerified =
          (user as { emailVerified?: boolean }).emailVerified === true;
        token.picture = await resolveProfileImage(user.email);
        token.sessionSyncedAt = Date.now();
        return token;
      }

      const sub = token.sub;
      if (sub) {
        const last = (token.sessionSyncedAt as number) || 0;
        const shouldSync = trigger === "update" || Date.now() - last > SESSION_SYNC_MS;
        if (shouldSync) {
          const row = await prisma.user.findUnique({
            where: { id: sub },
            select: { emailVerified: true, name: true, role: true, email: true },
          });
          token.emailVerified = row?.emailVerified != null;
          if (row?.role) {
            token.role = parseUserRole(row.role);
          }
          if (row?.name !== undefined && row.name !== null) {
            token.name = row.name;
          } else if (row?.name === null) {
            token.name = undefined;
          }
          token.picture = await resolveProfileImage(row?.email ?? (token.email as string | undefined));
          token.sessionSyncedAt = Date.now();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (token.email) session.user.email = token.email as string;
        if (token.name) session.user.name = token.name as string;
        session.user.image = token.picture ? (token.picture as string) : undefined;
        session.user.role = parseUserRole(token.role as string | undefined);
        session.user.isEmailVerified = token.emailVerified === true;
      }
      return session;
    },
  },
});
