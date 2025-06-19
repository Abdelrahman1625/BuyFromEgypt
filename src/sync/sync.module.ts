import { Module } from '@nestjs/common';
import { SyncController, AdminController } from './sync.controller';
import { SyncService } from './sync.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [SyncController, AdminController],
  providers: [SyncService, PrismaService],
  exports: [SyncService],
})
export class SyncModule {}
