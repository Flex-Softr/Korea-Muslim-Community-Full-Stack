import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  SUPPORTER_SUBMISSION_PRISMA_SETUP_MESSAGE,
  supporterSubmissionDelegate,
} from "@/lib/prisma-supporter-submission";
import { hasMinimumRole } from "@/lib/roles";

async function ensureAdmin() {
  const session = await auth();
  return Boolean(session?.user?.id && hasMinimumRole(session.user.role, "ADMIN"));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const delegate = supporterSubmissionDelegate();
  if (!delegate?.findUnique) {
    console.error(
      `[supporter-submissions] prisma.supporterSubmission is missing — ${SUPPORTER_SUBMISSION_PRISMA_SETUP_MESSAGE}`,
    );
    return NextResponse.json(
      { error: `Supporter submissions are not ready. ${SUPPORTER_SUBMISSION_PRISMA_SETUP_MESSAGE}` },
      { status: 503 },
    );
  }

  const { id } = await params;

  try {
    const item = await delegate.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...item,
      createdAt: item.createdAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Could not fetch submission details" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const delegate = supporterSubmissionDelegate();
  if (!delegate?.delete) {
    console.error(
      `[supporter-submissions] prisma.supporterSubmission is missing — ${SUPPORTER_SUBMISSION_PRISMA_SETUP_MESSAGE}`,
    );
    return NextResponse.json(
      { error: `Supporter submission storage is not ready. ${SUPPORTER_SUBMISSION_PRISMA_SETUP_MESSAGE}` },
      { status: 503 },
    );
  }

  const { id } = await params;

  try {
    await delegate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
