import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  HttpStatus,
  BadRequestException,
  HttpCode,
  UnauthorizedException,
  Patch,
  Query,
  HttpException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { Request } from 'express';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UserTypeGuard } from '../common/guards/user-type.guard';
import { UserType } from '../common/decorators/user-type.decorator';
import { TypeEnum } from '../common/enums/user-type.enum';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiResponse, ApiOperation, ApiParam, ApiTags, ApiQuery } from '@nestjs/swagger';
import { FilterProductsDto } from '../common/dto/filter-products.dto';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { Product } from './entities/product.entity';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UserType(`${TypeEnum.EXPORTER}`)
  @UseGuards(AuthGuard, UserTypeGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Req()
    req: Request & {
      user: { userId: string };
    },
    @Body() createProductDto: CreateProductDto
  ) {
    return this.productsService.createProduct(req.user.userId, createProductDto, files);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Return all products with filters and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (starts from 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Minimum price filter' })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Maximum price filter' })
  @ApiQuery({ name: 'minRating', required: false, type: Number, description: 'Minimum rating filter (0-5)' })
  @ApiQuery({ name: 'active', required: false, type: Boolean, description: 'Filter active products' })
  @ApiQuery({ name: 'categoryId', required: false, type: String, description: 'Filter by category ID' })
  @ApiQuery({ name: 'currencyCode', required: false, type: String, description: 'Filter by currency code (e.g., USD, EGP)' })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['price', 'rating', 'createdAt', 'name'],
    description: 'Field to sort by',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order',
  })
  async findAll(@Query() filters: FilterProductsDto): Promise<PaginatedResponse<Product>> {
    try {
      return await this.productsService.findAll(filters);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: error.message,
          error: error.name,
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('/categories-with-count')
  @ApiResponse({ status: 200, description: 'Return all categories with product counts' })
  async getCategoriesWithCount() {
    return this.productsService.getCategoriesWithProductCount();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findProductById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('images', 10))
  update(
    @UploadedFiles() files: Express.Multer.File[],
    @Req()
    req: Request & {
      user: { userId: string };
    },
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productsService.updateProduct(id, req.user.userId, updateProductDto, files);
  }

  @Put('admin/:id/:action')
  @Roles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async toggleProductState(
    @Req()
    req: Request & {
      user: { userId: string };
    },
    @Param('id') productId: string,
    @Param('action') action: 'approve' | 'deactivate'
  ): Promise<{ message: string }> {
    return this.productsService.toggleProductState(productId, req.user.userId, action);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product has been successfully deleted',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            productId: { type: 'string' },
            deletedAt: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User does not have permission to delete this product',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Failed to delete product',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        error: { type: 'string' },
      },
    },
  })
  async remove(@Req() req: Request & { user: { userId: string; role: string } }, @Param('id') id: string) {
    try {
      if (!req.user || !req.user.userId) {
        throw new UnauthorizedException({
          success: false,
          message: 'User is not authenticated',
          error: 'Unauthorized',
        });
      }

      if (!id) {
        throw new BadRequestException({
          success: false,
          message: 'Product ID is required',
          error: 'Bad Request',
        });
      }

      return await this.productsService.deleteProduct(id, req.user.userId, req.user.role);
    } catch (error) {
      console.error('Error in remove endpoint:', error);
      throw error;
    }
  }
}
