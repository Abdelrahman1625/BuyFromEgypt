import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CommentLikesService } from '../comment-likes/comment-likes.service';
import { MailService } from '../MailService/mail.service';
import { AuthModule } from '../auth/auth.module';
import { ValidationModule } from '../common/validation/validation.module';
import { CloudinaryModule } from '../common/modules/cloudinary/cloudinary.module';

@Module({
  imports: [AuthModule, ValidationModule, CloudinaryModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, CommentLikesService, MailService],
  exports: [UsersService],
})
export class UsersModule {}
