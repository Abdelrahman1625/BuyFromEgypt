import { ConflictException, ForbiddenException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import slugify from 'slugify';
import * as process from 'node:process';
import { CloudinaryService } from '../common/modules/cloudinary/cloudinary.service';
import { v4 as uuid } from 'uuid';
import { RoleEnum } from '../common/enums/role.enum';
import { FilterProductsDto, SortField, SortOrder } from '../common/dto/filter-products.dto';
import { PaginationService } from '../common/modules/pagination/pagination.service';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { FilterService } from '../common/modules/filter/filter.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private paginationService: PaginationService,
    private filterService: FilterService
  ) {}

  async findAll(filters?: FilterProductsDto): Promise<PaginatedResponse<Product>> {
    const { where, orderBy } = this.filterService.buildProductFilter(filters || {});

    const paginationOptions = this.paginationService.getPaginationOptions(filters || {});

    const total = await this.prisma.product.count({ where });

    const products = await this.prisma.product.findMany({
      where,
      orderBy,
      skip: paginationOptions.skip,
      take: paginationOptions.limit,
      select: {
        productId: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        currencyCode: true,
        active: true,
        rating: true,
        reviewCount: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            userId: true,
            name: true,
            email: true,
            role: true,
          },
        },
        category: {
          select: {
            categoryId: true,
            name: true,
            description: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
            isPrimary: true,
            productId: true,
          },
        },
      },
    });

    return this.paginationService.createPaginatedResponse(products, total, paginationOptions);
  }

  async createProduct(userId: string, createProductDto: CreateProductDto, files: Express.Multer.File[]): Promise<Product> {
    const user = await this.prisma.user.findFirst({ where: { userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found.`);

    const categoryId = createProductDto.categoryId;
    const category = await this.prisma.category.findFirst({ where: { categoryId } });
    if (!category) throw new NotFoundException(`Category with ID ${categoryId} not found`);

    const slug = slugify(createProductDto.name);
    const existedProduct = await this.prisma.product.findFirst({ where: { slug } });
    if (existedProduct) throw new ConflictException(`A product with the name "${createProductDto.name}" already exists.`);

    const cloudFolder = `${process.env.SITE_NAME}/products/${uuid()}`;

    try {
      let uploadedImages;
      if (files && files.length > 0) {
        uploadedImages = await this.cloudinaryService.uploadImages(files, cloudFolder);
      }

      const productData = {
        ...createProductDto,
        price: typeof createProductDto.price === 'string' ? parseFloat(createProductDto.price) : createProductDto.price,
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
      };

      const newProduct = await this.prisma.product.create({
        data: productData,
        include: {
          owner: { select: { userId: true, name: true, email: true, role: true } },
          category: { select: { categoryId: true, name: true, description: true } },
          images: true,
        },
      });
      return newProduct;
    } catch (err: any) {
      await this.cloudinaryService.deleteFolder(cloudFolder);
      throw new BadRequestException(`Failed to create product: ${err.message || 'Unknown error'}`);
    }
  }

  async findProductById(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { productId },
      include: {
        owner: { select: { userId: true, name: true, email: true, role: true } },
        images: true,
        category: { select: { categoryId: true, name: true, description: true } },
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

    if (updateProductDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { categoryId: updateProductDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(`Category with ID ${updateProductDto.categoryId} not found`);
      }
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
      await Promise.all(imagesToDelete.map((img) => this.cloudinaryService.deleteImage(img.id)));

      await this.prisma.productImage.deleteMany({
        where: {
          id: { in: updateProductDto.imagesToDelete },
          productId: productId,
        },
      });
    }

    let uploadedImages;
    if (files && files.length > 0) {
      if (product.images && product.images.length > 0) {
        try {
          await Promise.all(product.images.map((image) => this.cloudinaryService.deleteImage(image.id)));
        } catch (error) {
          console.error('Error deleting existing images from Cloudinary during product update:', error);
        }

        await this.prisma.productImage.deleteMany({
          where: {
            productId: productId,
          },
        });
      }
      if (product.cloudFolder) {
        uploadedImages = await this.cloudinaryService.uploadImages(files, product.cloudFolder);
      } else {
        console.warn(`Product ${productId} has no cloudFolder, skipping new image upload.`);
      }
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

  async deleteProduct(productId: string, userId: string, role: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { productId },
        include: { images: true, owner: true },
      });

      if (!product) {
        throw new NotFoundException({
          success: false,
          message: `Product with ID ${productId} not found!`,
          error: 'Not Found',
        });
      }

      if (product.ownerId !== userId && role !== RoleEnum.ADMIN) {
        throw new ForbiddenException({
          success: false,
          message: "You don't have permission to delete this product!",
          error: 'Forbidden',
        });
      }

      return await this.prisma.$transaction(async (prisma) => {
        try {
          if (product.images && product.images.length > 0) {
            try {
              await Promise.all(product.images.map((image) => this.cloudinaryService.deleteImage(image.id)));
            } catch (error) {
              console.error('Error deleting images from Cloudinary:', error);
              console.log('Continuing with product deletion despite image deletion error');
            }
            await prisma.productImage.deleteMany({
              where: {
                productId: productId,
              },
            });
          }
          if (product.cloudFolder) {
            try {
              await this.cloudinaryService.deleteFolder(product.cloudFolder);
            } catch (error) {
              console.error('Error deleting folder from Cloudinary:', error);
              console.log('Continuing with product deletion despite folder deletion error');
            }
          }

          await prisma.product.delete({ where: { productId } });

          return {
            success: true,
            message: `Product with ID ${productId} has been deleted successfully.`,
            data: {
              productId,
              deletedAt: new Date().toISOString(),
            },
          };
        } catch (error) {
          console.error('Error in transaction:', error);
          throw error;
        }
      });
    } catch (error) {
      console.error('Error in deleteProduct:', error);

      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException({
        success: false,
        message: 'Failed to delete product',
        error: error.message || 'Unknown error occurred during product deletion',
      });
    }
  }

  async getCategoriesWithProductCount() {
    const categories = await this.prisma.category.findMany({
      select: {
        categoryId: true,
        name: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return categories.map((category) => ({
      categoryId: category.categoryId,
      name: category.name,
      productCount: category._count.products,
    }));
  }
}
