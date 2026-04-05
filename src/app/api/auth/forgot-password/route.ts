import { NextResponse } from "next/server";
import { z } from "zod";
import { createPasswordResetForEmail } from "@/lib/password-reset/service";
import {
  clientIpFromRequest,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().email(),
});

const WINDOW_MS = 15 * 60 * 1000;
const FORGOT_LIMIT = 5;

export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  const limited = rateLimit(`forgot:${ip}`, FORGOT_LIMIT, WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: rateLimitHeaders(limited.retryAfterSec) },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  await createPasswordResetForEmail(parsed.data.email);

  return NextResponse.json({
    ok: true,
    message:
      "If an account exists for that email, we sent a link to reset your password.",
  });
}
