import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Readiness-style check: returns 503 if the database is unreachable.
 * Use for load balancers and deploy scripts.
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  try {
    await prisma.user.findFirst({ select: { id: true } });
    return NextResponse.json({
      ok: true,
      timestamp,
      checks: { database: "up" as const },
    });
  } catch (err) {
    console.error("[health] database check failed:", err);
    return NextResponse.json(
      {
        ok: false,
        timestamp,
        checks: { database: "down" as const },
      },
      { status: 503 },
    );
  }
}