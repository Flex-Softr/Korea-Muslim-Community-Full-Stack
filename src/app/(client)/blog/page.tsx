import type { Metadata } from "next";
import { PageBanner } from "@/components/layout/page-banner";
import { BlogListing } from "./blog-listing";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles, announcements, and student news from Korea Muslim Community.",
};

export default function BlogPage() {
  return (
    <>
      <PageBanner
        title="Blog"
        subtitle="Articles, announcements, and student life updates — browse by topic or year."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      />
      <BlogListing />
    </>
  );
}
