export type CategoryOption = {
  id: string;
  label: string;
  count?: number;
};

export type YearOption = {
  value: number;
  count?: number;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  categories: CategoryOption[];
  years: YearOption[];
  pagination: PaginationMeta;
};

export type ContentListQuery = {
  category?: string | null;
  year?: number | null;
  page?: number;
  pageSize?: number;
};
