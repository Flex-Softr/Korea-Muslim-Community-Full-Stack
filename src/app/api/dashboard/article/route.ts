import { dashboardContentCollectionHandlers } from "@/lib/api/dashboard-content-routes";

const handlers = dashboardContentCollectionHandlers("article");

export const GET = handlers.GET;
export const POST = handlers.POST;
