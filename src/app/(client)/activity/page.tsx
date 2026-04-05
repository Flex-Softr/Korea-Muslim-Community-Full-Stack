import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { ActivityListing } from "./activity-listing";

export const metadata: Metadata = {
  title: "Activity",
  description:
    "News and updates from Korea Muslim Community — programmes and outreach across Korea.",
};

export default function ActivityPage() {
  return (
    <>
      <PageBanner
        title="Activity"
        subtitle="Reports and updates in a news format — programmes and outreach across Korea."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Activity" }]}
      />
      <ActivityListing />
    </>
  );
}
