export interface Pagination {
  page: number;
  limit: number;
  offset: number;
}

export function parsePagination(query: { page?: unknown; limit?: unknown }): Pagination {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  return { page, limit, offset: (page - 1) * limit };
}
