import { Injectable } from '@nestjs/common';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PaginatedResponse, PaginationOptions, PaginationQuery } from '../../../common/interfaces/pagination.interface';

@Injectable()
export class PaginationService {
  getPaginationOptions(query: PaginationQuery): PaginationOptions {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    return {
      page,
      limit,
      skip,
    };
  }

  createPaginatedResponse<T>(data: T[], total: number, options: PaginationOptions): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / options.limit);
    const NextPage = options.page < totalPages;
    const PreviousPage = options.page > 1;

    return {
      data,
      meta: {
        total,
        page: options.page,
        limit: options.limit,
        totalPages,
        NextPage,
        PreviousPage,
      },
    };
  }
}
