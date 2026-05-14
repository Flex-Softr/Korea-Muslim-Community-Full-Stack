import { NextResponse } from "next/server";
import { z } from "zod";
import { CONTACT_OCCUPATION_VALUES } from "@/lib/contact/occupations";
import {
  CONTACT_FORM_PRISMA_SETUP_MESSAGE,
  contactFormSubmissionDelegate,
} from "@/lib/prisma-contact-form-submission";
import {
  clientIpFromRequest,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/rate-limit";

const mobileSchema = z
  .string()
  .trim()
  .min(8, "Mobile number is too short.")
  .max(40, "Mobile number is too long.")
  .regex(/^[\d+\s().-]+$/, "Mobile number contains invalid characters.");

const bodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  mobileNumber: mobileSchema,
  occupation: z.enum(CONTACT_OCCUPATION_VALUES),
  address: z.string().trim().min(1).max(500),
  visaType: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(5000),
});

const WINDOW_MS = 15 * 60 * 1000;
const CONTACT_LIMIT = 5;

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
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: issue?.message ?? "Invalid request. Check all fields." },
      { status: 400 },
    );
  }

  const { name, mobileNumber, occupation, address, visaType, message } =
    parsed.data;

  const contactDelegate = contactFormSubmissionDelegate();

  if (!contactDelegate?.create) {
    console.error(
      `[contact] prisma.contactFormSubmission is missing — ${CONTACT_FORM_PRISMA_SETUP_MESSAGE}`,
    );
    return NextResponse.json(
      {
        error: `Contact form storage is not ready. ${CONTACT_FORM_PRISMA_SETUP_MESSAGE}`,
      },
      { status: 503 },
    );
  }

  try {
    await contactDelegate.create({
      data: {
        name,
        mobileNumber,
        occupation,
        address,
        visaType,
        message,
      },
    });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json(
      { error: "Could not save your message. Try again later." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Thanks — we received your message.",
  });
}
