import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SyncController, AdminController } from './sync.controller';
import { SyncService } from './sync.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  imports: [HttpModule],
  controllers: [SyncController, AdminController],
  providers: [SyncService, PrismaService],
  exports: [SyncService],
})
export class SyncModule {}
