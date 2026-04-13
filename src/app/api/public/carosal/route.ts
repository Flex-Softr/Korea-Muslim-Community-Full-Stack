import { NextResponse } from "next/server";
import { listDashboardCarousel } from "@/lib/dashboard/store";

export async function GET() {
  const items = (await listDashboardCarousel()).filter((item) => item.isActive);
  return NextResponse.json({ items });
}
