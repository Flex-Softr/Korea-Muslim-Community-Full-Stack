import { dashboardContentItemHandlers } from "@/lib/api/dashboard-content-routes";

const handlers = dashboardContentItemHandlers("other-page");

export const GET = handlers.GET;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
