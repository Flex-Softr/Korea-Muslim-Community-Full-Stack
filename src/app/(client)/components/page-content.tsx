"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { ReusablePagination } from "@/components/ui/reusable-pagination";

type PageDataItem = {
  id: string;
  image: string;
  title: string;
  description: string;
  category: string;
  slug: string;
};

type PageDataResponse = {
  items?: PageDataItem[];
  pagination?: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
};

function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function PageContent({ category }: { category?: string }) {
  const { t } = useLanguage();
  const pathname = usePathname();

  const [items, setItems] = useState<PageDataItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Get category from last route segment
  const pageCategory = useMemo(() => {
    if (category?.trim()) return category.trim();

    const lastSegment = pathname.split("/").filter(Boolean).at(-1) ?? "";

    return lastSegment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }, [category, pathname]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          category: pageCategory,
          page: String(page),
          pageSize: "3",
        });

        const res = await fetch(
          `/api/public/other-page-data?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        const data = (await res.json()) as PageDataResponse;

        if (!res.ok || cancelled) return;

        setItems(data.items ?? []);
        setTotalPages(data.pagination?.totalPages ?? 1);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [page, pageCategory]);

  useEffect(() => {
    setPage(1);
  }, [pageCategory]);

  return (
    <div className="flex flex-col gap-4">
      {loading && items.length === 0 ? (
        <div className="border-b-4 border-[#5bc0de] px-3 py-4 shadow-sm shadow-gray-400">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="border-b-4 border-[#5bc0de] px-3 py-4 shadow-sm shadow-gray-400">
          <p className="text-lg text-muted-foreground">No page data found.</p>
        </div>
      ) : null}

      {items.map((block) => (
        <div
          key={block.id}
          className="flex flex-col gap-3 border-b-4 border-[#5bc0de] px-3 py-4 shadow-sm shadow-gray-400"
        >
          <h1 className="cursor-pointer text-3xl hover:underline">{block.title}</h1>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="w-full md:w-1/3">
              <Image
                src={block.image}
                alt={block.title}
                className="h-auto w-full"
                width={320}
                height={220}
              />
            </div>
            <div className="w-full md:w-2/3">
              <p className="line-clamp-4 text-lg">{stripHtml(block.description)}</p>
              <Link
                href={`/${slugify(block.category)}/${block.slug}`}
                className="mt-3 inline-block text-sm font-medium text-[#2c7bb6] underline-offset-4 hover:underline"
              >
                Read more
              </Link>
            </div>
          </div>
        </div>
      ))}

      {totalPages > 1 ? (
        <ReusablePagination currentPage={page} totalPages={totalPages} onChange={setPage} />
      ) : null}
    </div>
  );
}
