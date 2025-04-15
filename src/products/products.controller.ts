import { Controller, Get, Post, Body, Put, Param, Delete, Req, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, HttpStatus, BadRequestException } from '@nestjs/common';
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
import { ApiResponse } from '@nestjs/swagger';

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

  // @Put('admin/approveProduct/:id')
  // @Roles(RoleEnum.ADMIN)
  // @UseGuards(AuthGuard, RolesGuard)
  // async approveUser(@Req() req: Request & { user: { userId: string } }, @Param('id') productId: string): Promise<{ message: string }> {
  //   return this.productsService.toggleProductState(productId, req.user.userId, 'approve');
  // }
  //
  // @Put('admin/deactivateProduct/:id')
  // @Roles(RoleEnum.ADMIN)
  // @UseGuards(AuthGuard, RolesGuard)
  // async deactivateUser(@Req() req: Request & { user: { userId: string } }, @Param('id') productId: string): Promise<{ message: string }> {
  //   return this.productsService.toggleProductState(productId, req.user.userId, 'deactivate');
  // }

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
  async remove(@Req() req: Request & { user: { userId: string; role: string } }, @Param('id') id: string) {
    return await this.productsService.deleteProduct(id, req.user.userId, req.user.role);
  }
}