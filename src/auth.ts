import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { env } from "@/config/env";
import { parseUserRole, type UserRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

/** Re-sync verification (and display name) from the DB periodically for JWT sessions. */
const SESSION_SYNC_MS = 2 * 60 * 1000;

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
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
        token.role = user.role as UserRole;
        token.emailVerified =
          (user as { emailVerified?: boolean }).emailVerified === true;
        token.sessionSyncedAt = Date.now();
        return token;
      }

      const sub = token.sub;
      if (sub) {
        const last = (token.sessionSyncedAt as number) || 0;
        if (Date.now() - last > SESSION_SYNC_MS) {
          const row = await prisma.user.findUnique({
            where: { id: sub },
            select: { emailVerified: true, name: true },
          });
          token.emailVerified = row?.emailVerified != null;
          if (row?.name !== undefined && row.name !== null) {
            token.name = row.name;
          } else if (row?.name === null) {
            token.name = undefined;
          }
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
        session.user.role = parseUserRole(token.role as string | undefined);
        session.user.isEmailVerified = token.emailVerified === true;
      }
      return session;
    },
  },
});
