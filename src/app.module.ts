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
import { CommentLikesModule } from './comment-likes/comment-likes.module';
import { CategoriesModule } from './categories/categories.module';
import { FollowModule } from './follow/follow.module';
import { ValidationModule } from './common/validation/validation.module';
import { ChatModule } from './chat/chat.module';
import { SearchModule } from './search/search.module';
import { SocialMediaModule } from './social-media/social-media.module';
import { RatingModule } from './rating/rating.module';
import { SaveItemsModule } from './save-items/save-items.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthModule,
    ProductsModule,
    PostsModule,
    CommentLikesModule,
    CommentsModule,
    CategoriesModule,
    FollowModule,
    ValidationModule,
    ChatModule,
    SearchModule,
    SocialMediaModule,
    RatingModule,
    SaveItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  //  , { provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule {}
