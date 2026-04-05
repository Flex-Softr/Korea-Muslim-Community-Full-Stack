import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/roles";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      /** True when the account email has been verified (credentials signup flow). */
      isEmailVerified: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
    emailVerified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    emailVerified?: boolean;
    sessionSyncedAt?: number;
  }
}
