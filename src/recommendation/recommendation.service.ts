import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RecommendationRequestDto } from './dto/recommendation-request.dto';
import { TypeEnum } from '@prisma/client';

@Injectable()
export class RecommendationService {
  constructor(private prisma: PrismaService) {}

  async getRecommendations(userId: string, dto: RecommendationRequestDto, type: 'product' | 'post') {
    let preferences = dto;
    if ((!dto.preferred_industries || dto.preferred_industries.length === 0) && userId) {
      const userPref = await this.prisma.userPreference.findUnique({
        where: { userId },
      });
      if (userPref) {
        preferences = {
          ...preferences,
          preferred_industries: userPref.industries,
          preferred_supplier_type: userPref.supplierType ?? undefined,
        };
      }
    }

    let items: any[] = [];
    if (type === 'product') {
      items = await this.prisma.product.findMany({
        where: {
          category: preferences.preferred_industries && preferences.preferred_industries.length > 0 ? { name: { in: preferences.preferred_industries } } : undefined,
          owner: preferences.preferred_supplier_type
            ? {
                type: preferences.preferred_supplier_type.toUpperCase() as TypeEnum,
              }
            : undefined,
        },
        take: 10,
      });
    } else if (type === 'post') {
      const orConditions: any[] = [];
      if (preferences.preferred_industries && preferences.preferred_industries.length > 0) {
        orConditions.push({
          products: {
            some: {
              category: {
                name: { in: preferences.preferred_industries },
              },
            },
          },
        });
      }
      if (preferences.keywords && preferences.keywords.length > 0) {
        orConditions.push({
          OR: preferences.keywords.map((kw) => [{ title: { contains: kw, mode: 'insensitive' } }, { content: { contains: kw, mode: 'insensitive' } }]).flat(),
        });
      }
      items = await this.prisma.post.findMany({
        where: orConditions.length > 0 ? { OR: orConditions } : undefined,
        take: 10,
        include: {
          user: {
            select: {
              userId: true,
              name: true,
            },
          },
          products: true,
          images: true,
        },
      });
    }

    return {
      status: 'success',
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} recommendations generated successfully`,
      data: {
        recommendations: items,
        user_id: userId,
        recommendation_type: type,
        generated_at: new Date().toISOString(),
      },
    };
  }
}
