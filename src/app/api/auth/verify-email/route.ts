import { NextResponse } from "next/server";
import {
  clientIpFromRequest,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/rate-limit";
import { verifyEmailWithToken } from "@/lib/email-verification/service";

const WINDOW_MS = 15 * 60 * 1000;
const VERIFY_GET_LIMIT = 30;

export async function GET(request: Request) {
  const ip = clientIpFromRequest(request);
  const limited = rateLimit(`verify-email:${ip}`, VERIFY_GET_LIMIT, WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: rateLimitHeaders(limited.retryAfterSec) },
    );
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const result = await verifyEmailWithToken(token);

  if (result.ok) {
    return NextResponse.redirect(new URL("/login?verified=1", request.url));
  }
  return NextResponse.redirect(
    new URL(
      `/login?verify=invalid&message=${encodeURIComponent(result.error)}`,
      request.url,
    ),
  );
}
