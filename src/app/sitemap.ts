import type { MetadataRoute } from "next";
import { getAllBlogSlugs } from "@/data/student-news";
import { getSiteOrigin } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteOrigin();
  const now = new Date();

  const blogPosts = getAllBlogSlugs().map((slug) => ({
    url: `${base}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.55,
  }));

  const paths = [
    "",
    "/about",
    "/blog",
    "/gallery",
    "/activity",
    "/team",
    "/consultation",
    "/library",
    "/videos",
    "/contact",
    "/donation",
    "/privacy",
    "/terms",
  ];

  const staticEntries = paths.map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "" ? 1 : 0.6,
  }));

  return [...staticEntries, ...blogPosts];
}
