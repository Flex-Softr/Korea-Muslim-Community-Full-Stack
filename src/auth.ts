import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { authenticateCredentials } from "@/lib/auth-credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
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
