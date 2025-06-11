import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CommentLikesService } from '../comment-likes/comment-likes.service';
import { MailService } from '../MailService/mail.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, CommentLikesService, MailService],
})
export class UsersModule {}
