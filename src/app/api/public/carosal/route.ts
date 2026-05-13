import { NextResponse } from "next/server";
import { listDashboardCarousel } from "@/lib/dashboard/store";
import { pickCarouselFields } from "@/lib/i18n/content-locale";
import { getRequestLang } from "@/lib/i18n/server-language";

export async function GET() {
  const lang = await getRequestLang();
  const items = (await listDashboardCarousel())
    .filter((item) => item.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((slide) => {
      const loc = pickCarouselFields(slide.localeContent, lang);
      return {
        id: slide.id,
        title: loc.title,
        subtitle: loc.subtitle,
        imageUrl: slide.imageUrl,
        ctaLabel: loc.ctaLabel?.trim() || undefined,
        ctaHref: slide.ctaHref,
        sortOrder: slide.sortOrder,
      };
    });
  return NextResponse.json({ items });
}
