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
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { Request } from 'express';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UserTypeGuard } from '../common/guards/user-type.guard';
import { UserType } from '../common/decorators/user-type.decorator';
import { TypeEnum } from '../common/enums/user-type.enum';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleEnum } from '@prisma/client';
import { RolesGuard } from '../common/guards/roles.guard';
import { ApiResponse, ApiOperation, ApiParam } from '@nestjs/swagger';

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
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findProductById(id);
  }

  @Post(':id')
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
  @ApiOperation({ summary: 'Delete a product' })
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
