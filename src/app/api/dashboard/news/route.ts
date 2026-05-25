import { dashboardContentCollectionHandlers } from "@/lib/api/dashboard-content-routes";

const handlers = dashboardContentCollectionHandlers("news");

export const GET = handlers.GET;
export const POST = handlers.POST;
