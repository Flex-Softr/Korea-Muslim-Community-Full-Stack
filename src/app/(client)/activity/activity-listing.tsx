"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ActivityCategoryFilter } from "@/components/activity/activity-category-filter";
import { ActivityNewsCard } from "@/components/activity/activity-news-card";
import { useLanguage } from "@/components/providers/language-provider";
import { DataPagination } from "@/components/ui/pagination";
import type { ActivityNewsItem } from "@/data/activity-news";
import { usePagination } from "@/hooks/use-pagination";

const PAGE_SIZE = 8;

const GRID_IMAGE_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";

type ActivityListingProps = {
  items: ActivityNewsItem[];
  categories: string[];
  years: number[];
  initialCategory: string | null;
  initialYear: number | null;
  initialPage: number;
};

export function ActivityListing({
  items,
  categories,
  years,
  initialCategory,
  initialYear,
  initialPage,
}: ActivityListingProps) {
  const { t } = useLanguage();
  const router = useRouter();

  // ✅ ensure pathname is always a safe string
  const pathname = usePathname() ?? "/";

  const searchParams = useSearchParams();

  // safe fallback
  const searchParamsString =
    searchParams?.toString() ?? "";

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory
  );
  const [selectedYear, setSelectedYear] = useState<number | null>(initialYear);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory != null && item.category !== selectedCategory) {
        return false;
      }
      if (selectedYear != null) {
        const year = Number(item.dateIso?.slice(0, 4));
        if (year !== selectedYear) return false;
      }
      return true;
    });
  }, [items, selectedCategory, selectedYear]);

  const { page, setPage, totalPages, offset } = usePagination({
    totalItems: filtered.length,
    pageSize: PAGE_SIZE,
    initialPage,
  });

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedYear, setPage]);

  useEffect(() => {
    const params = new URLSearchParams(searchParamsString);

    if (selectedCategory) params.set("category", selectedCategory);
    else params.delete("category");

    if (selectedYear != null) params.set("year", String(selectedYear));
    else params.delete("year");

    params.set("page", String(page));

    const next = params.toString();
    const url = next ? `${pathname}?${next}` : pathname;

    // ✅ fully safe string passed
    router.replace(url, { scroll: false });
  }, [
    page,
    pathname,
    router,
    searchParamsString,
    selectedCategory,
    selectedYear,
  ]);

  const pageItems = filtered.slice(offset, offset + PAGE_SIZE);

  return (
    <div className="border-b border-border/40 bg-muted/25 py-10 dark:bg-muted/10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ActivityCategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          className="mb-4"
        />

        <ActivityCategoryFilter
          categories={years.map(String)}
          selectedCategory={selectedYear != null ? String(selectedYear) : null}
          onSelectCategory={(year) =>
            setSelectedYear(year != null ? Number.parseInt(year, 10) : null)
          }
          title={t("blog.filterByYear")}
          allLabel={t("blog.allYears")}
          clearLabel={t("blog.clearYear")}
          ariaLabel="Activity years"
          className="mb-8 sm:mb-10"
        />

        <p className="mb-6 text-sm text-muted-foreground sm:mb-8">
          {items.length === 0 ? (
            <>{t("activity.noStoriesYet")}</>
          ) : filtered.length === 0 ? (
            <>
              {t("activity.noStoriesMatch")}{" "}
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedYear(null);
                }}
                className="font-medium text-[#2c7bb6] underline-offset-4 hover:underline dark:text-sky-400"
              >
                {t("blog.showAll")}
              </button>
              .
            </>
          ) : (
            <>
              {t("blog.showing")}{" "}
              <span className="font-medium text-foreground">
                {offset + 1}–{offset + pageItems.length}
              </span>{" "}
              {t("blog.of")}{" "}
              <span className="font-medium text-foreground">
                {filtered.length}
              </span>{" "}
              {filtered.length === 1
                ? t("activity.story")
                : t("activity.stories")}
            </>
          )}
        </p>

        {pageItems.length > 0 && (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pageItems.map((item) => (
              <li key={item.id} className="min-w-0">
                <ActivityNewsCard item={item} imageSizes={GRID_IMAGE_SIZES} />
              </li>
            ))}
          </ul>
        )}

        {filtered.length > 0 && totalPages > 1 && (
          <DataPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-10"
            ariaLabel="Activity list pagination"
            showSummary
            align="center"
          />
        )}
      </div>
    </div>
  );
}


// "use client";

// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { useEffect, useMemo, useState } from "react";
// import { ActivityCategoryFilter } from "@/components/activity/activity-category-filter";
// import { ActivityNewsCard } from "@/components/activity/activity-news-card";
// import { useLanguage } from "@/components/providers/language-provider";
// import { DataPagination } from "@/components/ui/pagination";
// import type { ActivityNewsItem } from "@/data/activity-news";
// import { usePagination } from "@/hooks/use-pagination";

// const PAGE_SIZE = 8;

// const GRID_IMAGE_SIZES =
//   "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";

// type ActivityListingProps = {
//   items: ActivityNewsItem[];
//   categories: string[];
//   years: number[];
//   initialCategory: string | null;
//   initialYear: number | null;
//   initialPage: number;
// };

// export function ActivityListing({
//   items,
//   categories,
//   years,
//   initialCategory,
//   initialYear,
//   initialPage,
// }: ActivityListingProps) {
//   const { t } = useLanguage();
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const searchParamsString = searchParams.toString();
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(
//     initialCategory,
//   );
//   const [selectedYear, setSelectedYear] = useState<number | null>(initialYear);

//   const filtered = useMemo(() => {
//     return items.filter((item) => {
//       if (selectedCategory != null && item.category !== selectedCategory) {
//         return false;
//       }
//       if (selectedYear != null) {
//         const year = Number(item.dateIso?.slice(0, 4));
//         if (year !== selectedYear) return false;
//       }
//       return true;
//     });
//   }, [items, selectedCategory, selectedYear]);

//   const { page, setPage, totalPages, offset } = usePagination({
//     totalItems: filtered.length,
//     pageSize: PAGE_SIZE,
//     initialPage,
//   });

//   useEffect(() => {
//     setPage(1);
//   }, [selectedCategory, selectedYear, setPage]);

//   useEffect(() => {
//     const params = new URLSearchParams(searchParamsString);
//     if (selectedCategory) params.set("category", selectedCategory);
//     else params.delete("category");
//     if (selectedYear != null) params.set("year", String(selectedYear));
//     else params.delete("year");
//     params.set("page", String(page));
//     const next = params.toString();
//     router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
//   }, [
//     page,
//     pathname,
//     router,
//     searchParamsString,
//     selectedCategory,
//     selectedYear,
//   ]);

//   const pageItems = filtered.slice(offset, offset + PAGE_SIZE);

//   return (
//     <div className="border-b border-border/40 bg-muted/25 py-10 dark:bg-muted/10 sm:py-12 lg:py-14">
//       <div className="mx-auto max-w-7xl px-4 sm:px-6">
//         <ActivityCategoryFilter
//           categories={categories}
//           selectedCategory={selectedCategory}
//           onSelectCategory={setSelectedCategory}
//           className="mb-4"
//         />
//         <ActivityCategoryFilter
//           categories={years.map(String)}
//           selectedCategory={selectedYear != null ? String(selectedYear) : null}
//           onSelectCategory={(year) =>
//             setSelectedYear(year != null ? Number.parseInt(year, 10) : null)
//           }
//           title={t("blog.filterByYear")}
//           allLabel={t("blog.allYears")}
//           clearLabel={t("blog.clearYear")}
//           ariaLabel="Activity years"
//           className="mb-8 sm:mb-10"
//         />

//         <p className="mb-6 text-sm text-muted-foreground sm:mb-8">
//           {items.length === 0 ? (
//             <>{t("activity.noStoriesYet")}</>
//           ) : filtered.length === 0 ? (
//             <>
//               {t("activity.noStoriesMatch")}{" "}
//               <button
//                 type="button"
//                 onClick={() => {
//                   setSelectedCategory(null);
//                   setSelectedYear(null);
//                 }}
//                 className="font-medium text-[#2c7bb6] underline-offset-4 hover:underline dark:text-sky-400"
//               >
//                 {t("blog.showAll")}
//               </button>
//               .
//             </>
//           ) : (
//             <>
//               {t("blog.showing")}{" "}
//               <span className="font-medium text-foreground">
//                 {offset + 1}–{offset + pageItems.length}
//               </span>{" "}
//               {t("blog.of")}{" "}
//               <span className="font-medium text-foreground">
//                 {filtered.length}
//               </span>{" "}
//               {filtered.length === 1 ? t("activity.story") : t("activity.stories")}
//               {selectedCategory != null || selectedYear != null ? (
//                 <>
//                   {" "}
//                   {t("blog.withActiveFilters")}
//                   {selectedCategory != null ? (
//                     <>
//                       {" "}
//                       {t("blog.in")}{" "}
//                       <span className="font-medium text-foreground">
//                         {selectedCategory}
//                       </span>
//                     </>
//                   ) : null}
//                   {selectedYear != null ? (
//                     <>
//                       {" "}
//                       {t("blog.for")}{" "}
//                       <span className="font-medium text-foreground">
//                         {selectedYear}
//                       </span>
//                     </>
//                   ) : null}
//                 </>
//               ) : null}
//             </>
//           )}
//         </p>

//         {pageItems.length > 0 ? (
//           <ul
//             className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
//             aria-label="Activity and news"
//           >
//             {pageItems.map((item) => (
//               <li key={item.id} className="min-w-0">
//                 <ActivityNewsCard
//                   item={item}
//                   imageSizes={GRID_IMAGE_SIZES}
//                 />
//               </li>
//             ))}
//           </ul>
//         ) : null}

//         {filtered.length > 0 && totalPages > 1 ? (
//           <DataPagination
//             page={page}
//             totalPages={totalPages}
//             onPageChange={setPage}
//             className="mt-10"
//             ariaLabel="Activity list pagination"
//             showSummary
//             align="center"
//           />
//         ) : null}
//       </div>
//     </div>
//   );
// }
