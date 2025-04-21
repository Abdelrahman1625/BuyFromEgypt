import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostLikeDto } from './dto/create-post-like.dto';

@Injectable()
export class PostLikesService {
  constructor(private prisma: PrismaService) {}

  async likePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      return this.unlikePost(userId, postId);
    }
    return this.prisma.postLike.create({
      data: {
        userId,
        postId,
      },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            profileImage: true,
          },
        },
        post: true,
      },
    });
  }

  async unlikePost(userId: string, postId: string) {
    return this.prisma.postLike.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
  }

  async getPostLikes(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return this.prisma.postLike.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });
  }

  async getUserLikes(userId: string) {
    return this.prisma.postLike.findMany({
      where: { userId },
      include: {
        post: true,
      },
    });
  }

  async countLikes(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return this.prisma.postLike.count({
      where: { postId },
    });
  }
}
