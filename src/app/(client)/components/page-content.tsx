"use client";

import Image from "next/image";
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
  rawCategory: string;
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
  const { lang } = useLanguage();

  const pathnameRaw = usePathname();
  const pathname = pathnameRaw ?? ""; // ✅ FIX: ensure never null

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
          category:
            pageCategory === "Women S Division"
              ? "Women's Division"
              : pageCategory,
          page: String(page),
          pageSize: "3",
          lang: lang,
        });
        const res = await fetch(
          `/api/public/other-page-data?${params.toString()}`,
          {
            cache: "no-store",
          },
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
  }, [page, pageCategory, lang]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
          <h2 className="text-xl font-semibold">{block.title}</h2>
          <hr />
          <div className="mt-2">
            {block.image && (
              <div className="w-full md:w-2/4 mx-auto">
                <Image
                  src={block.image}
                  alt={block.title}
                  className="w-full"
                  width={320}
                  height={220}
                />
              </div>
            )}

            <div className="mt-5">
              <div
                dangerouslySetInnerHTML={{ __html: block.description }}
              ></div>
            </div>
          </div>
        </div>
      ))}

      {totalPages > 1 ? (
        <ReusablePagination
          currentPage={page}
          totalPages={totalPages}
          onChange={setPage}
        />
      ) : null}
    </div>
  );
}
