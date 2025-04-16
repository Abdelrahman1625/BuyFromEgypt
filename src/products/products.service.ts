import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import slugify from 'slugify';
import * as process from 'node:process';
import { CloudinaryService } from '../common/modules/cloudinary/cloudinary.service';
import { v4 as uuid } from 'uuid';
import { RoleEnum } from '../common/enums/role.enum';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private cloudinaryService: CloudinaryService
  ) {}

  async findAll(): Promise<Product[]> {
    const products = this.prisma.product.findMany({
      include: {
        owner: true,
        category: {
          include: { user: true },
        },
        images: true,
      },
    });
    return products;
  }

  async createProduct(userId: string, createProductDto: CreateProductDto, files: Express.Multer.File[]): Promise<Product> {
    const user = await this.prisma.user.findFirst({ where: { userId } });
    if (!user) throw new NotFoundException(`User with this ID not found.`);

    const categoryId = createProductDto.categoryId;

    const category = await this.prisma.category.findFirst({ where: { categoryId } });
    if (!category) throw new ConflictException(`Category ${categoryId} not found`);

    const slug = slugify(createProductDto.name);
    const existedProduct = await this.prisma.product.findFirst({ where: { slug } });
    if (existedProduct) throw new ConflictException(`A product with the name "${createProductDto.name}" already exists.`);
    const cloudFolder = `${process.env.SITE_NAME}/products/${uuid()}`;
    let uploadedImages;
    if (files && files.length > 0) {
      uploadedImages = await this.cloudinaryService.uploadImages(files, cloudFolder);
    }
    const newProduct = await this.prisma.product
      .create({
        data: {
          ...createProductDto,
          slug,
          ownerId: userId,
          cloudFolder,
          images: {
            create: uploadedImages?.map((img: any, index: number) => ({
              url: img.url,
              id: img.id,
              isPrimary: index === 0,
            })),
          },
        },
        include: {
          owner: true,
          images: true,
          category: {
            include: { user: true },
          },
        },
      })
      .catch(async (err) => {
        if (cloudFolder) await this.cloudinaryService.deleteFolder(cloudFolder);
        throw err;
      });
    return newProduct;
  }

  async findProductById(productId: string) {
    const product = this.prisma.product.findUnique({

      where: { productId },
      include: {
        owner: true,
        images: true,
        category: {
          include: { user: true },
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }
    return product;
  }

  async updateProduct(productId: string, userId: string, updateProductDto: UpdateProductDto, files?: Express.Multer.File[]): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { productId },
      include: { images: true, owner: true },
    });

    if (!product) throw new NotFoundException(`Product with ID ${productId} not found!`);

    const category = await this.prisma.category.findUnique({
      where: { categoryId: updateProductDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${updateProductDto.categoryId} not found`);
    }

    if (product.ownerId !== userId) throw new ForbiddenException(`You don't have permission to update this product!`);

    let slug = product.slug;
    if (updateProductDto.name && updateProductDto.name !== product.name) {
      slug = slugify(updateProductDto.name);
      const nameTaken = await this.prisma.product.findFirst({ where: { slug, NOT: { productId } } });
      if (nameTaken) throw new ConflictException(`Product name "${updateProductDto.name}" already exists`);
    }

    if (updateProductDto.imagesToDelete?.length) {
      const imagesToDelete = product.images.filter((img) => updateProductDto.imagesToDelete?.includes(img.id));

      await Promise.all(imagesToDelete.map((img) => this.cloudinaryService.deleteImage(img.id).catch((e) => console.error(`Failed to delete image ${img.id}:`, e))));

      await this.prisma.productImage.deleteMany({
        where: {
          id: { in: updateProductDto.imagesToDelete },
          productId: productId,
        },
      });
    }

    let uploadedImages;
    if (files && files.length > 0 && product.cloudFolder) {
      uploadedImages = await this.cloudinaryService.uploadImages(files, product.cloudFolder);
    }
    const { imagesToDelete, ...updateData } = updateProductDto;
    const updatedProduct = await this.prisma.product.update({
      where: { productId },
      data: {
        ...updateData,
        slug,
        images: {
          create: uploadedImages?.map((img, index) => ({
            url: img.url,
            id: img.id,
            isPrimary: index === 0 && product.images.length === 0,
          })),
        },
      },
      include: {
        owner: true,
        images: true,
        category: {
          include: { user: true },
        },
      },
    });
    return updatedProduct;
  }

  async toggleProductState(
    productId: string,
    userId: string,
    state: 'approve' | 'deactivate'
  ): Promise<{
    message: string;
  }> {
    const product = await this.prisma.product.findFirst({ where: { productId } });

    if (!product) throw new NotFoundException(`Product with ID ${productId} not found.`);

    const isActive = product.active;

    if (state === 'approve' && isActive) throw new ConflictException(`Product with ID ${productId} is already approved.`);

    if (state === 'deactivate' && !isActive) throw new ConflictException(`Product with ID ${productId} is already deactivated.`);

    await this.prisma.product.update({
      where: { productId },
      data: { active: state === 'approve', approvedById: userId, approvedAt: new Date().toISOString() },
    });

    const action = state === 'approve' ? 'approved' : 'deactivated';

    return { message: `Product with ID ${productId} has been ${action} successfully.` };
  }

  async deleteProduct(productId: string, userId: string, role: string): Promise<{ message: string }> {
    const product = await this.prisma.product.findUnique({
      where: { productId },
      include: { images: true, owner: true },
    });

    if (!product) throw new NotFoundException(`Product with ID ${productId} not found!`);

    if (product.ownerId !== userId || role != RoleEnum.ADMIN) throw new ForbiddenException(`You don't have permission to update this product!`);

    await this.prisma.product.delete({ where: { productId } });
    return {
      message: `Product with ID ${productId} has been deleted successfully.`,
    };
  }
}
