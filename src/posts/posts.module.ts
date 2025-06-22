import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryModule } from '../common/modules/cloudinary/cloudinary.module';
import { SaveItemsService } from '../save-items/save-items.service';
import { PaginationModule } from '../common/modules/pagination/pagination.module';
import { HttpModule } from '@nestjs/axios';
import { FilterModule } from '../common/modules/filter/filter.module';

@Module({
  imports: [CloudinaryModule, PaginationModule, HttpModule, FilterModule],
  controllers: [PostsController],
  providers: [PostsService, PrismaService, SaveItemsService],
})
export class PostsModule {}
