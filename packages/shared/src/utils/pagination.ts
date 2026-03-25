export type PaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export function calculatePagination(
  page: number,
  limit: number,
  total: number
): {
  skip: number;
  take: number;
  pagination: { page: number; limit: number; total: number; pages: number };
} {
  const pages = Math.ceil(total / limit) || 1;
  const safePage = Math.max(1, Math.min(page, pages));

  return {
    skip: (safePage - 1) * limit,
    take: limit,
    pagination: {
      page: safePage,
      limit,
      total,
      pages,
    },
  };
}
