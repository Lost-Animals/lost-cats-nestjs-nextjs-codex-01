export interface PaginationQuery {
  page?: number;
  page_size?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
}
