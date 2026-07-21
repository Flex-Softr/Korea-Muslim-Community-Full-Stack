import { NextResponse } from "next/server";
import { z } from "zod";
import {
  SUPPORTER_SUBMISSION_PRISMA_SETUP_MESSAGE,
  supporterSubmissionDelegate,
} from "@/lib/prisma-supporter-submission";
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

const supporterSubmissionSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(120),
  mobileNumber: mobileSchema,
  occupation: z.string().trim().min(1, "Occupation is required.").max(200),
  address: z.string().trim().min(1, "Address is required.").max(500),
  visaType: z.string().trim().min(1, "Visa type is required.").max(200),
  whyWantBecomeSupporter: z
    .string()
    .trim()
    .min(1, "Please state why you want to become a supporter.")
    .max(5000),
  previouslySupporter: z.preprocess(
    (val) => (typeof val === "string" ? val === "true" : Boolean(val)),
    z.boolean()
  ),
  directJoinOnOrganization: z.preprocess(
    (val) => (typeof val === "string" ? val === "true" : Boolean(val)),
    z.boolean()
  ),
});

const WINDOW_MS = 15 * 60 * 1000;
const SUBMISSION_LIMIT = 5;

// ---------- GET (list with pagination) ----------
export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Math.max(parseInt(url.searchParams.get("page") ?? "1"), 1);
  const pageSize = Math.max(parseInt(url.searchParams.get("pageSize") ?? "20"), 1);
  const skip = (page - 1) * pageSize;

  const delegate = supporterSubmissionDelegate();
  if (!delegate?.findMany || !delegate?.count) {
    console.error(
      `[supporter-submission] prisma support missing — ${SUPPORTER_SUBMISSION_PRISMA_SETUP_MESSAGE}`
    );
    return NextResponse.json(
      { error: `Supporter submission storage is not ready. ${SUPPORTER_SUBMISSION_PRISMA_SETUP_MESSAGE}` },
      { status: 503 }
    );
  }

  try {
    const [items, total] = await Promise.all([
      delegate.findMany({ skip, take: pageSize, orderBy: { createdAt: "desc" } }),
      delegate.count(),
    ]);
    return NextResponse.json({ items, total, page, pageSize });
  } catch (err) {
    console.error("[supporter-submission] GET error", err);
    return NextResponse.json({ error: "Failed to retrieve submissions" }, { status: 500 });
  }
}

// ---------- POST (create new submission) ----------
export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  const limited = rateLimit(`supporter-submission:${ip}`, SUBMISSION_LIMIT, WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many submissions. Try again later." },
      { status: 429, headers: rateLimitHeaders(limited.retryAfterSec) }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = supporterSubmissionSchema.safeParse(json);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: issue?.message ?? "Invalid request. Check all fields." },
      { status: 400 }
    );
  }

  const {
    name,
    mobileNumber,
    occupation,
    address,
    visaType,
    whyWantBecomeSupporter,
    previouslySupporter,
    directJoinOnOrganization,
  } = parsed.data;

  const delegate = supporterSubmissionDelegate();

  if (!delegate?.create) {
    console.error(
      `[supporter-submission] prisma.supporterSubmission is missing — ${SUPPORTER_SUBMISSION_PRISMA_SETUP_MESSAGE}`
    );
    return NextResponse.json(
      {
        error: `Supporter submission storage is not ready. ${SUPPORTER_SUBMISSION_PRISMA_SETUP_MESSAGE}`,
      },
      { status: 503 }
    );
  }

  try {
    await delegate.create({
      data: {
        name,
        mobileNumber,
        occupation,
        address,
        visaType,
        whyWantBecomeSupporter,
        previouslySupporter,
        directJoinOnOrganization,
      },
    });
  } catch (err) {
    console.error("[supporter-submission]", err);
    return NextResponse.json(
      { error: "Could not save your submission. Try again later." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Thank you — your supporter submission has been received.",
  });
}
