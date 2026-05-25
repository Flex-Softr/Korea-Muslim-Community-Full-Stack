import { dashboardContentCollectionHandlers } from "@/lib/api/dashboard-content-routes";

const handlers = dashboardContentCollectionHandlers("other-page");

export const GET = handlers.GET;
export const POST = handlers.POST;
