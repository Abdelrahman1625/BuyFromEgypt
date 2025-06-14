import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export const SEARCH_TYPES = ['users', 'products', 'messages'] as const;

export type SearchType = (typeof SEARCH_TYPES)[number];

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(term: string, type: SearchType) {
    this.validateSearchType(type);

    const searchMap = {
      users: () => this.searchUser(term),
      products: () => this.searchProduct(term),
      // messages: () => this.searchMessage(term),
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
      },
    });
  }
}
