import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryModule } from '../common/modules/cloudinary/cloudinary.module';
import { SaveItemsService } from '../save-items/save-items.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [PostsController],
  providers: [PostsService, PrismaService, SaveItemsService],
})
export class PostsModule {}
