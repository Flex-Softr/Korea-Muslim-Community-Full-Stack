/**
 * Build a compact list of page indices and ellipsis markers for UI pagination.
 * Uses a window around `current` plus first/last pages; inserts `"ellipsis"` for gaps.
 */
export function getPaginationItems(
  currentPage: number,
  totalPages: number,
  /** Pages to show on each side of the current page (minimum 0). */
  siblingCount = 1,
): Array<number | "ellipsis"> {
  const total = Math.max(0, Math.floor(totalPages));
  const current = Math.min(Math.max(1, Math.floor(currentPage)), Math.max(1, total));

  if (total <= 0) {
    return [];
  }
  if (total === 1) {
    return [1];
  }

  const delta = Math.max(0, siblingCount);
  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);

  for (let i = current - delta; i <= current + delta; i++) {
    if (i >= 1 && i <= total) {
      pages.add(i);
    }
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const out: Array<number | "ellipsis"> = [];
  let prev = 0;

  for (const p of sorted) {
    if (prev > 0 && p - prev > 1) {
      out.push("ellipsis");
    }
    out.push(p);
    prev = p;
  }

  return out;
}

export function clampPage(page: number, totalPages: number): number {
  const total = Math.max(1, Math.floor(totalPages));
  const p = Math.floor(page);
  if (Number.isNaN(p)) {
    return 1;
  }
  return Math.min(Math.max(1, p), total);
}

export function totalPagesFromCount(totalItems: number, pageSize: number): number {
  const size = Math.max(1, Math.floor(pageSize));
  const items = Math.max(0, Math.floor(totalItems));
  return Math.max(1, Math.ceil(items / size));
}

export function offsetForPage(page: number, pageSize: number): number {
  const size = Math.max(1, Math.floor(pageSize));
  const p = clampPage(page, Number.MAX_SAFE_INTEGER);
  return (p - 1) * size;
}
