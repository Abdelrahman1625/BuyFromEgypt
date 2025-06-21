import { Module } from '@nestjs/common';
import { SaveItemsService } from './save-items.service';
import { SaveItemsController } from './save-items.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationModule } from '../common/modules/pagination/pagination.module';

@Module({
  controllers: [SaveItemsController],
  providers: [SaveItemsService, PrismaService],
  imports: [PaginationModule],
})
export class SaveItemsModule {}
