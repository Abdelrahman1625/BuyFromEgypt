import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationGateway } from '../notification/notification.gateway';

@Module({
  controllers: [RatingController],
  providers: [RatingService,PrismaService,NotificationService,NotificationGateway],
})
export class RatingModule {}
