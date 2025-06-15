export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  NextPage: boolean;
  PreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
