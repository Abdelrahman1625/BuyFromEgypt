import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ValidationService } from '../common/validation/validation.service';

export const ENTITY_TYPES = ['post', 'product'] as const;
export type SaveableEntity = (typeof ENTITY_TYPES)[number];

@Injectable()
export class SaveItemsService {
  constructor(
    private prisma: PrismaService,
    private validationService: ValidationService
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

  async getSaved(entityType: SaveableEntity, userId: string) {
    const relation = this.getRelationField(entityType);

    const user = await this.prisma.user.findUnique({
      where: { userId },
      include: {
        [relation]: {
          include:
            entityType === 'post'
              ? {
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
                }
              : undefined,
        },
      },
    });

    return user?.[relation] ?? [];
  }
}
