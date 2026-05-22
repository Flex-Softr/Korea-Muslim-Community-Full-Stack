import "server-only";

import { revalidateTag } from "next/cache";
import type { DashboardContentType } from "@/lib/dashboard/store";

const CONTENT_TAGS: Record<DashboardContentType, string> = {
  blog: "cms:blog",
  activity: "cms:activity",
  photo: "cms:photo",
  video: "cms:video",
};

export function revalidateCmsContent(type: DashboardContentType) {
  revalidateTag(CONTENT_TAGS[type], "max");
  revalidateTag("cms:home", "max");
}

export function revalidateCmsCarousel() {
  revalidateTag("cms:carousel", "max");
  revalidateTag("cms:home", "max");
}
