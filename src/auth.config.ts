import type { NextAuthConfig } from "next-auth";
import { parseUserRole } from "@/lib/roles";

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        if (user.email) token.email = user.email;
        if (user.name) token.name = user.name;
        if (user.image) token.picture = user.image;
        token.role = parseUserRole(user.role);
        token.emailVerified =
          (user as { emailVerified?: boolean }).emailVerified === true;
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
} satisfies NextAuthConfig;
