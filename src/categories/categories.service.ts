import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

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
        user: true,
      },
    });

    return category;
  }

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      include: { user: true },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(categoryId: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { categoryId },
      include: { user: true, products: true },
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
      include: { user: true },
    });

    return updatedCategory;
  }

  async remove(categoryId: string): Promise<{ message: string }> {
    const category = await this.prisma.category.findUnique({ where: { categoryId } });

    if (!category) {
      throw new NotFoundException(`Category with ID '${categoryId}' not found.`);
    }

    await this.prisma.category.delete({ where: { categoryId } });

    return { message: `Category with ID '${categoryId}' has been deleted successfully.` };
  }
}
