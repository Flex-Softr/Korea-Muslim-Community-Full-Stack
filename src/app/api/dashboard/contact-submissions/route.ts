import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  CONTACT_FORM_PRISMA_SETUP_MESSAGE,
  contactFormSubmissionDelegate,
} from "@/lib/prisma-contact-form-submission";
import {
  clampPage,
  offsetForPage,
  totalPagesFromCount,
} from "@/lib/pagination/get-pagination-items";
import { hasMinimumRole } from "@/lib/roles";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !hasMinimumRole(session.user.role, "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const delegate = contactFormSubmissionDelegate();
  if (!delegate?.count || !delegate.findMany) {
    console.error(
      `[contact-submissions] prisma.contactFormSubmission is missing — ${CONTACT_FORM_PRISMA_SETUP_MESSAGE}`,
    );
    return NextResponse.json(
      { error: `Contact list is not ready. ${CONTACT_FORM_PRISMA_SETUP_MESSAGE}` },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const pageRaw = Math.max(
    1,
    Number.parseInt(searchParams.get("page") ?? "1", 10) || 1,
  );
  const pageSize = Math.max(
    1,
    Math.min(
      50,
      Number.parseInt(searchParams.get("pageSize") ?? "10", 10) || 10,
    ),
  );

  const rawTotal = await delegate.count();
  const totalPages = totalPagesFromCount(rawTotal, pageSize);
  const page = clampPage(pageRaw, totalPages);

  const rows = await delegate.findMany({
    orderBy: { createdAt: "desc" },
    skip: offsetForPage(page, pageSize),
    take: pageSize,
    select: {
      id: true,
      name: true,
      mobileNumber: true,
      occupation: true,
      address: true,
      visaType: true,
      message: true,
      createdAt: true,
    },
  });

  const items = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json({
    items,
    pagination: {
      page,
      pageSize,
      totalItems: rawTotal,
      totalPages,
    },
  });
}
