import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { authenticateCredentials } from "@/lib/auth-credentials";
import { prisma } from "@/lib/prisma";
import { ensurePrivilegedDbRole } from "@/lib/privileged-roles";
import { parseUserRole } from "@/lib/roles";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
        if (user.image) token.picture = user.image;
        token.role = parseUserRole(user.role);
        token.emailVerified =
          (user as { emailVerified?: boolean }).emailVerified === true;
        token.sessionSyncedAt = Date.now();
        return token;
      }

      if (token.sub) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { email: true, role: true, emailVerified: true },
          });
          if (dbUser) {
            token.role = await ensurePrivilegedDbRole(
              token.sub,
              dbUser.email,
              dbUser.role,
            );
            token.emailVerified = Boolean(dbUser.emailVerified);
            if (dbUser.email) token.email = dbUser.email;
          }
        } catch {
          // Keep existing token role if DB sync fails (e.g. transient outage).
        }
        token.sessionSyncedAt = Date.now();
      }

      return token;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const result = await authenticateCredentials(
          credentials?.email as string | undefined,
          credentials?.password as string | undefined,
        );
        return result.ok ? result.user : null;
      },
    }),
  ],
});
