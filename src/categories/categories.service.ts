import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../common/modules/cloudinary/cloudinary.service';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async create(userId: string, createCategoryDto: CreateCategoryDto, image?: Express.Multer.File): Promise<Category> {
    const user = await this.prisma.user.findFirst({ where: { userId } });
    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found.`);
    }

    let imageUrl: string | undefined = undefined;
    if (image) {
      const uploaded = await this.cloudinaryService.uploadImage(image, `categories`);
      imageUrl = uploaded.url;
    }

    const category = await this.prisma.category.create({
      data: {
        ...createCategoryDto,
        userId,
        image: imageUrl,
      },
      include: {
        user: {
          select: { userId: true, name: true, email: true, role: true, type: true, active: true },
        },
      },
    });

    return category;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<Category>> {
    try {
      const page = Number(paginationDto.page) || 1;
      const limit = Number(paginationDto.limit) || 10;
      const skip = (page - 1) * limit;

      const [categories, total] = await Promise.all([
        this.prisma.category.findMany({
          skip,
          take: limit,
          include: {
            user: {
              select: { userId: true, name: true, email: true, role: true, type: true, active: true },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        }),
        this.prisma.category.count(),
      ]);

      return {
        data: categories,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          NextPage: page < Math.ceil(total / limit),
          PreviousPage: page > 1,
        },
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error(`A unique constraint would be violated: ${error.meta?.target}`);
      }
      if (error.code === 'P2025') {
        throw new Error(`Record not found: ${error.meta?.cause}`);
      }
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  async findOne(categoryId: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { categoryId },
      include: {
        user: {
          select: { userId: true, name: true, email: true, role: true, type: true, active: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID '${categoryId}' not found.`);
    }

    return category;
  }

  async update(categoryId: string, updateCategoryDto: UpdateCategoryDto, image?: Express.Multer.File): Promise<Category> {
    const category = await this.prisma.category.findUnique({ where: { categoryId } });

    if (!category) {
      throw new NotFoundException(`Category with ID '${categoryId}' not found.`);
    }

    let imageUrl: string | undefined = undefined;
    if (image) {
      if (category.image) {
        const publicId = extractPublicIdFromUrl(category.image);
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId);
        }
      }
      const uploaded = await this.cloudinaryService.uploadImage(image, `categories`);
      imageUrl = uploaded.url;
    }

    const updatedCategory = await this.prisma.category.update({
      where: { categoryId },
      data: { ...updateCategoryDto, image: imageUrl ?? category.image },
      include: {
        user: {
          select: { userId: true, name: true, email: true, role: true, type: true, active: true },
        },
      },
    });

    return updatedCategory;
  }

  async remove(categoryId: string): Promise<{ message: string }> {
    const category = await this.prisma.category.findUnique({ where: { categoryId } });

    if (!category) {
      throw new NotFoundException(`Category with ID '${categoryId}' not found.`);
    }

    if (category.image) {
      const publicId = extractPublicIdFromUrl(category.image);
      if (publicId) {
        await this.cloudinaryService.deleteImage(publicId);
      }
    }

    await this.prisma.$transaction(async (prisma) => {
      const productsToDel = await prisma.product.findMany({
        where: { categoryId },
        include: { images: true },
      });

      for (const product of productsToDel) {
        if (product.images && product.images.length > 0) {
          try {
            await Promise.all(product.images.map((image) => this.cloudinaryService.deleteImage(image.id)));
          } catch (error) {
            console.error(`Error deleting images for product ${product.productId} from Cloudinary:`, error);
            console.log('Continuing with product deletion despite image deletion error');
          }
          await prisma.productImage.deleteMany({
            where: {
              productId: product.productId,
            },
          });
        }
        if (product.cloudFolder) {
          try {
            await this.cloudinaryService.deleteFolder(product.cloudFolder);
          } catch (error) {
            console.error(`Error deleting Cloudinary folder for product ${product.productId}:`, error);
            console.log('Continuing with product deletion despite folder deletion error');
          }
        }
        await prisma.product.delete({ where: { productId: product.productId } });
      }
      await prisma.category.delete({ where: { categoryId } });
    });

    return { message: `Category with ID '${categoryId}' has been deleted successfully.` };
  }
}

function extractPublicIdFromUrl(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)\./);
  return match ? match[1] : null;
}
