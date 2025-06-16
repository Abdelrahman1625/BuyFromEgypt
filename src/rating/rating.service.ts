import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ValidationService } from '../common/validation/validation.service';

const RATEABLE_ENTITIES = ['post', 'product'] as const;
export type RateableEntity = (typeof RATEABLE_ENTITIES)[number];

interface RatingInput {
  userId: string;
  entityId: string;
  value: number;
  comment: string;
}

@Injectable()
export class RatingService {
  constructor(
    private prisma: PrismaService,
    private validationService: ValidationService
  ) {}

  async rate(entityType: RateableEntity, { userId, entityId, value, comment }: RatingInput) {
    if (!RATEABLE_ENTITIES.includes(entityType)) throw new BadRequestException('Invalid entity type');

    if (entityType === 'post') await this.validationService.validatePostExists(entityId);
    else await this.validationService.validateProductExists(entityId);

    const identifierField = `${entityType}Id`;
    const uniqueConstraint = `userId_${identifierField}`;

    await this.prisma.rating.upsert({
      where: {
        [uniqueConstraint]: {
          userId,
          [identifierField]: entityId,
        },
      } as any,
      update: {
        value,
        comment,
      },
      create: {
        value,
        comment,
        userId,
        [identifierField]: entityId,
      },
    });

    const { _avg, _count } = await this.prisma.rating.aggregate({
      where: {
        [identifierField]: entityId,
      },
      _avg: { value: true },
      _count: true,
    });

    const updateData = {
      rating: _avg.value ?? 0,
      reviewCount: _count,
    };

    if (entityType === 'post') {
      await this.prisma.post.update({
        where: { postId: entityId },
        data: updateData,
      });
    } else {
      await this.prisma.product.update({
        where: { productId: entityId },
        data: updateData,
      });
    }
    return {
      message: 'Rating updated successfully',
      averageRating: _avg.value ?? 0,
      comment: comment,
      totalReviews: _count,
    };
  }
}
