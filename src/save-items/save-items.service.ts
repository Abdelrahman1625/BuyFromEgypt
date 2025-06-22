import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ValidationService } from '../common/validation/validation.service';
import { PaginationService } from '../common/modules/pagination/pagination.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { FilterProductsDto } from '../common/dto/filter-products.dto';
import { FilterService } from '../common/modules/filter/filter.service';

export const ENTITY_TYPES = ['post', 'product'] as const;
export type SaveableEntity = (typeof ENTITY_TYPES)[number];

@Injectable()
export class SaveItemsService {
  constructor(
    private prisma: PrismaService,
    private validationService: ValidationService,
    private paginationService: PaginationService,
    private filterService: FilterService
  ) {}

  private getRelationField(entityType: SaveableEntity) {
    return entityType === 'post' ? 'savedPosts' : 'savedProducts';
  }

  private async validateEntityExists(entityType: SaveableEntity, entityId: string) {
    if (entityType === 'post') {
      await this.validationService.validatePostExists(entityId);
    } else {
      await this.validationService.validateProductExists(entityId);
    }
  }

  async save(entityType: SaveableEntity, entityId: string, userId: string) {
    if (!ENTITY_TYPES.includes(entityType)) {
      throw new BadRequestException('Invalid entity type');
    }

    await this.validateEntityExists(entityType, entityId);

    await this.prisma.user.update({
      where: { userId },
      data: {
        [this.getRelationField(entityType)]: {
          connect: { [`${entityType}Id`]: entityId },
        },
      },
    });

    return {
      success: true,
      message: `${entityType === 'post' ? 'Post' : 'Product'} saved successfully`,
    };
  }

  async unsave(entityType: SaveableEntity, entityId: string, userId: string) {
    if (!ENTITY_TYPES.includes(entityType)) {
      throw new BadRequestException('Invalid entity type');
    }

    await this.validateEntityExists(entityType, entityId);

    await this.prisma.user.update({
      where: { userId },
      data: {
        [this.getRelationField(entityType)]: {
          disconnect: { [`${entityType}Id`]: entityId },
        },
      },
    });

    return {
      success: true,
      message: `${entityType === 'post' ? 'Post' : 'Product'} removed from saved items successfully`,
    };
  }

  async getSaved(entityType: SaveableEntity, userId: string, filterDto: FilterProductsDto): Promise<PaginatedResponse<any>> {
    const relation = this.getRelationField(entityType);
    const paginationOptions = this.paginationService.getPaginationOptions(filterDto);

    const userWithCount = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        _count: {
          select: { [relation]: true },
        },
      },
    });
    const total = userWithCount?._count?.[relation] || 0;

    let where = undefined;
    let orderBy = undefined;
    if (entityType === 'product') {
      const filter = this.filterService.buildProductFilter(filterDto || {});
      where = filter.where;
      orderBy = filter.orderBy;
    }

    const user = await this.prisma.user.findUnique({
      where: { userId },
      include: {
        [relation]: {
          skip: paginationOptions.skip,
          take: paginationOptions.limit,
          ...(entityType === 'product' && where ? { where } : {}),
          ...(entityType === 'product' && orderBy ? { orderBy } : {}),
          ...(entityType === 'post'
            ? {
                include: {
                  user: {
                    select: {
                      userId: true,
                      name: true,
                      email: true,
                      role: true,
                      isOnline: true,
                    },
                  },
                  images: true,
                  products: true,
                },
              }
            : {}),
        },
      },
    });
    const data = user?.[relation] ?? [];
    return this.paginationService.createPaginatedResponse<any>(data, total, paginationOptions);
  }
}
