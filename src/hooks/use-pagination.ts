"use client";

import { useCallback, useMemo, useState } from "react";
import {
  clampPage,
  offsetForPage,
  totalPagesFromCount,
} from "@/lib/pagination/get-pagination-items";

export type UsePaginationOptions = {
  /** Total number of items across all pages. */
  totalItems: number;
  /** Items per page (minimum 1). */
  pageSize: number;
  /** Initial page (1-based). */
  initialPage?: number;
};

/**
 * Local pagination state: current page, total pages, and item offset for queries.
 * For URL-driven pagination, control `page` from the router instead.
 */
export function usePagination({
  totalItems,
  pageSize,
  initialPage = 1,
}: UsePaginationOptions) {
  const totalPages = useMemo(
    () => totalPagesFromCount(totalItems, pageSize),
    [totalItems, pageSize],
  );

  const [rawPage, setRawPage] = useState(() =>
    clampPage(initialPage ?? 1, totalPagesFromCount(totalItems, pageSize)),
  );

  const page = clampPage(rawPage, totalPages);

  const setPage = useCallback(
    (next: number) => {
      setRawPage(clampPage(next, totalPages));
    },
    [totalPages],
  );

  const offset = useMemo(
    () => offsetForPage(page, pageSize),
    [page, pageSize],
  );

  return {
    page,
    setPage,
    totalPages,
    pageSize,
    offset,
  };
}
