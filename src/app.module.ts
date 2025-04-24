import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsModule } from './products/products.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { PostLikesModule } from './post-likes/post-likes.module';
import { CategoriesModule } from './categories/categories.module';
import { FollowModule } from './follow/follow.module';
import { ValidationModule } from './common/validation/validation.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), UsersModule, AuthModule, ProductsModule, PostsModule, PostLikesModule, CommentsModule, CategoriesModule, FollowModule, ValidationModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  //  , { provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule {}
