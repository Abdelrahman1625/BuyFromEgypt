import { Injectable } from '@nestjs/common';
import { FilterProductsDto, SortOrder } from '../../dto/filter-products.dto';

@Injectable()
export class FilterService {
  buildProductFilter(filters: FilterProductsDto): any {
    const where: any = {};
    const orderBy: any = {};

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = Number(filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = Number(filters.maxPrice);
      }
    }

    if (filters.minRating !== undefined) {
      where.rating = {
        gte: filters.minRating,
      };
    }

    if (filters.inStock !== undefined) {
      where.stock = {
        gt: 0,
      };
    }

    if (filters.active !== undefined) {
      where.active = filters.active;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.currencyCode) {
      where.currencyCode = filters.currencyCode;
    }

    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || SortOrder.ASC;
    } else {
      orderBy.createdAt = SortOrder.DESC;
    }

    return { where, orderBy };
  }
}
