import { NextResponse } from "next/server";
import { z } from "zod";
import { resetPasswordWithToken } from "@/lib/password-reset/service";
import {
  clientIpFromRequest,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/rate-limit";

const bodySchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

const WINDOW_MS = 15 * 60 * 1000;
const RESET_LIMIT = 10;

export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  const limited = rateLimit(`reset:${ip}`, RESET_LIMIT, WINDOW_MS);
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
    return NextResponse.json(
      { error: "Token and password (min 8 characters) required" },
      { status: 400 },
    );
  }

  const result = await resetPasswordWithToken(
    parsed.data.token,
    parsed.data.password,
  );

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
