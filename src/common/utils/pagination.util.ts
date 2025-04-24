import { PaginationDto } from '../dto/pagination.dto';

export function paginateResponse<T>(data: T[], total: number, pagination: PaginationDto) {
  const page = pagination.page || 1;
  const limit = pagination.limit || 10;

  const lastPage = Math.ceil(total / limit);
  const nextPage = page + 1 > lastPage ? null : page + 1;
  const prevPage = page - 1 < 1 ? null : page - 1;

  return {
    data,
    meta: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      totalPages: lastPage,
      nextPage,
      prevPage,
    },
  };
}
