import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/config/env";
import { sendMail } from "@/lib/email/send-mail";
import { buildContactSubmissionEmail } from "@/lib/email/templates/contact-submission";
import {
  clientIpFromRequest,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/rate-limit";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(1).max(5000),
});

const WINDOW_MS = 15 * 60 * 1000;
const CONTACT_LIMIT = 5;

function contactRecipient(): string | null {
  const direct = env.CONTACT_TO_EMAIL?.trim();
  if (direct) return direct;
  const from = env.EMAIL_FROM?.trim();
  if (from) return from;
  return null;
}

function appName(): string {
  return env.APP_NAME?.trim() || "App";
}

export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  const limited = rateLimit(`contact:${ip}`, CONTACT_LIMIT, WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many messages. Try again later." },
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
      { error: "Name, valid email, and message (max 5000 chars) required." },
      { status: 400 },
    );
  }

  const to = contactRecipient();
  if (!to) {
    return NextResponse.json(
      {
        error:
          "Contact form is not configured. Set CONTACT_TO_EMAIL or EMAIL_FROM.",
      },
      { status: 503 },
    );
  }

  const { name, email, message } = parsed.data;
  const { subject, html, text } = buildContactSubmissionEmail({
    appName: appName(),
    fromName: name,
    fromEmail: email,
    message,
  });

  try {
    await sendMail({
      to,
      subject,
      html,
      text,
      replyTo: email,
    });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json(
      { error: "Could not send message. Try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Thanks — we received your message.",
  });
}
