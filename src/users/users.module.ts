import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { PostLikesService } from '../post-likes/post-likes.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService,PostLikesService],
})
export class UsersModule {}
