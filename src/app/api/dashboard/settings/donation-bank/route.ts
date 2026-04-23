import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getDonationBankDetails,
  updateDonationBankDetails,
} from "@/lib/settings/donation-bank";
import { hasMinimumRole } from "@/lib/roles";

function ensureObjectBody(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

async function ensureAdmin() {
  const session = await auth();
  if (!session?.user?.id || !hasMinimumRole(session.user.role, "ADMIN")) {
    return false;
  }
  return true;
}

export async function GET() {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const details = await getDonationBankDetails();
  return NextResponse.json({ details });
}

export async function PATCH(request: Request) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as unknown;
  if (!ensureObjectBody(body)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const details = await updateDonationBankDetails({
    bankName: body.bankName as string | null | undefined,
    accountName: body.accountName as string | null | undefined,
    accountNumber: body.accountNumber as string | null | undefined,
    branch: body.branch as string | null | undefined,
    swift: body.swift as string | null | undefined,
    referenceNote: body.referenceNote as string | null | undefined,
  });

  return NextResponse.json({ ok: true, details });
}
