import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../common/modules/cloudinary/cloudinary.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  async create(userId: string, createCategoryDto: CreateCategoryDto): Promise<Category> {
    const user = await this.prisma.user.findFirst({ where: { userId } });
    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found.`);
    }

    const category = await this.prisma.category.create({
      data: {
        ...createCategoryDto,
        userId,
      },
      include: {
        user: {
          select: { userId: true, name: true, email: true, role: true, type: true, active: true },
        },
      },
    });

    return category;
  }

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      include: {
        user: {
          select: { userId: true, name: true, email: true, role: true, type: true, active: true },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
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

  async update(categoryId: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.prisma.category.findUnique({ where: { categoryId } });

    if (!category) {
      throw new NotFoundException(`Category with ID '${categoryId}' not found.`);
    }

    const updatedCategory = await this.prisma.category.update({
      where: { categoryId },
      data: { ...updateCategoryDto },
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
