import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAndSendEmailVerification } from "@/lib/email-verification/service";
import { prisma } from "@/lib/prisma";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

const WINDOW_MS = 60 * 60 * 1000;
const RESEND_LIMIT = 3;

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = rateLimit(
    `resend-verify:${session.user.id}`,
    RESEND_LIMIT,
    WINDOW_MS,
  );
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many resend attempts. Try again later." },
      { status: 429, headers: rateLimitHeaders(limited.retryAfterSec) },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (user.emailVerified) {
    return NextResponse.json({ ok: true, message: "Email already verified." });
  }

  try {
    await createAndSendEmailVerification(session.user.id);
  } catch (err) {
    console.error("[resend-verification]", err);
    return NextResponse.json(
      { error: "Could not send email. Check server email configuration." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Verification email sent. Check your inbox.",
  });
}
