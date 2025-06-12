import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationGateway } from '../notification/notification.gateway';

@Module({
  controllers: [FollowController],
  providers: [FollowService,PrismaService,NotificationService,NotificationGateway],
})
export class FollowModule {}
