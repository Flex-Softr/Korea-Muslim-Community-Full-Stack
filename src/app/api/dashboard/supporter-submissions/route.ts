import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  SUPPORTER_SUBMISSION_PRISMA_SETUP_MESSAGE,
  supporterSubmissionDelegate,
} from "@/lib/prisma-supporter-submission";
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

  const delegate = supporterSubmissionDelegate();
  if (!delegate?.count || !delegate.findMany) {
    console.error(
      `[supporter-submissions] prisma.supporterSubmission is missing — ${SUPPORTER_SUBMISSION_PRISMA_SETUP_MESSAGE}`,
    );
    return NextResponse.json(
      {
        error: `Supporter submission list is not ready. ${SUPPORTER_SUBMISSION_PRISMA_SETUP_MESSAGE}`,
      },
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
      whyWantBecomeSupporter: true,
      previouslySupporter: true,
      directJoinOnOrganization: true,
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
