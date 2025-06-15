import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryModule } from '../common/modules/cloudinary/cloudinary.module';
import { PaginationModule } from '../common/modules/pagination/pagination.module';
import { FilterModule } from '../common/modules/filter/filter.module';
import { SaveItemsService } from '../save-items/save-items.service';

@Module({
  imports: [CloudinaryModule, PaginationModule, FilterModule],
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService, SaveItemsService],
  exports: [ProductsService],
})
export class ProductsModule {}
