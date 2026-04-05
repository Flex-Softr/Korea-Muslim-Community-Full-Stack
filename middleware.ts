import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { roleAtLeast, roleIsOneOf } from "@/lib/role-guards";

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const isDashboard = path.startsWith("/dashboard");

  if (isDashboard && !req.auth) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  if (
    isDashboard &&
    req.auth?.user &&
    !req.auth.user.isEmailVerified
  ) {
    return NextResponse.redirect(
      new URL("/verify-email/pending", req.url),
    );
  }

  const role = req.auth?.user?.role as string | undefined;

  if (req.auth && path.startsWith("/dashboard/super-admin")) {
    if (!roleAtLeast(role, "SUPER_ADMIN")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (req.auth && path.startsWith("/dashboard/admin")) {
    if (!roleIsOneOf(role, ["ADMIN", "SUPER_ADMIN"])) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
