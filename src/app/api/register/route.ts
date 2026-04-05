import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import {
  clientIpFromRequest,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { createAndSendEmailVerification } from "@/lib/email-verification/service";

const WINDOW_MS = 15 * 60 * 1000;
const REGISTER_LIMIT = 5;

export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  const limited = rateLimit(`register:${ip}`, REGISTER_LIMIT, WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many registration attempts. Try again later." },
      { status: 429, headers: rateLimitHeaders(limited.retryAfterSec) },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { email, password, name } = body as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (!email?.trim() || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Valid email and password (min 8 chars) required" },
      { status: 400 },
    );
  }

  const normalized = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: normalized },
  });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const hashed = await hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email: normalized,
      password: hashed,
      name: name?.trim() || null,
      role: "USER",
    },
  });

  try {
    await createAndSendEmailVerification(user.id);
  } catch (err) {
    console.error("[register] verification email failed:", err);
  }

  return NextResponse.json({ ok: true });
}
