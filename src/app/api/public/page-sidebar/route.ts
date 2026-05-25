import { NextResponse } from "next/server";
import {
  listDashboardArticles,
  listDashboardNewsItems,
  listDashboardPhotos,
  listDashboardVideos,
} from "@/lib/dashboard/store";

function toItem(row: { id: string; title: string; coverImage?: string; videoUrl?: string; slug?: string }) {
  return {
    id: row.id,
    title: row.title,
    image: row.coverImage || "/brand/logo.png",
    videoUrl: row.videoUrl ?? null,
    slug: row.slug ?? row.id,
  };
}

export async function GET() {
  const [articles, news, photos, videos] = await Promise.all([
    listDashboardArticles(),
    listDashboardNewsItems(),
    listDashboardPhotos(),
    listDashboardVideos(),
  ]);

  return NextResponse.json({
    articles: articles.slice(0, 5).map(toItem),
    news: news.slice(0, 5).map(toItem),
    photos: photos.slice(0, 5).map(toItem),
    videos: videos.slice(0, 5).map(toItem),
  });
}
