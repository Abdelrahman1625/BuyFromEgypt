import { Module } from '@nestjs/common';
import { SaveItemsService } from './save-items.service';
import { SaveItemsController } from './save-items.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [SaveItemsController],
  providers: [SaveItemsService,PrismaService],
})
export class SaveItemsModule {}
