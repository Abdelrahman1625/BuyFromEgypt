import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSearchHistoryDto, GetSearchHistoryDto } from './dto/search-history.dto';

export const SEARCH_TYPES = ['users', 'products', 'messages'] as const;

export type SearchType = (typeof SEARCH_TYPES)[number];

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(term: string, type: SearchType, userId: string) {
    this.validateSearchType(type);
    await this.createSearchHistory({ query: term, type }, userId);

    const searchMap = {
      users: () => this.searchUser(term),
      products: () => this.searchProduct(term),
    };

    return searchMap[type]();
  }

  private validateSearchType(type: string): void {
    if (!SEARCH_TYPES.includes(type as SearchType)) {
      throw new BadRequestException(`Invalid search type. Valid types are: ${SEARCH_TYPES.join(', ')}`);
    }
  }

  private async searchUser(term: string) {
    return this.prisma.user.findMany({
      where: {
        name: { contains: term, mode: 'insensitive' },
      },
      take: 5,
      select: {
        userId: true,
        name: true,
        profileImage: true,
      },
    });
  }

  private async searchProduct(term: string) {
    return this.prisma.product.findMany({
      where: {
        name: { contains: term, mode: 'insensitive' },
      },
      take: 5,
      select: {
        productId: true,
        name: true,
        images: {
          where: {
            isPrimary: true,
          },
          select: {
            url: true,
          },
        },
      },
    });
  }

  async createSearchHistory(dto: CreateSearchHistoryDto, userId: string) {
    return this.prisma.searchHistory.create({
      data: {
        query: dto.query,
        type: dto.type,
        userId,
      },
    });
  }

  async getSearchHistory(userId: string, filters?: GetSearchHistoryDto) {
    const where = {
      userId,
      ...(filters?.type && { type: filters.type }),
    };

    return this.prisma.searchHistory.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });
  }

  async clearSearchHistory(userId: string) {
    return this.prisma.searchHistory.deleteMany({
      where: {
        userId,
      },
    });
  }
}
