import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  CONTACT_FORM_PRISMA_SETUP_MESSAGE,
  contactFormSubmissionDelegate,
} from "@/lib/prisma-contact-form-submission";
import { hasMinimumRole } from "@/lib/roles";

async function ensureAdmin() {
  const session = await auth();
  return Boolean(session?.user?.id && hasMinimumRole(session.user.role, "ADMIN"));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const delegate = contactFormSubmissionDelegate();
  if (!delegate?.delete) {
    console.error(
      `[contact-submissions] prisma.contactFormSubmission is missing - ${CONTACT_FORM_PRISMA_SETUP_MESSAGE}`,
    );
    return NextResponse.json(
      { error: `Contact list is not ready. ${CONTACT_FORM_PRISMA_SETUP_MESSAGE}` },
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
