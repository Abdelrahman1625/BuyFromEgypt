import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PostLikesService } from '../post-likes/post-likes.service';
import { MailService } from '../MailService/mail.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, PostLikesService, MailService],
})
export class UsersModule {}
