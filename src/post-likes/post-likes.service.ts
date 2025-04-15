import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostLikeDto } from './dto/create-post-like.dto';
import { ReactionType } from '@prisma/client';

@Injectable()
export class PostLikesService {
  constructor(private prisma: PrismaService) {}

  private allowedReactions = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY'];

  async create(createPostLikeDto: CreatePostLikeDto) {
    const { postId, userId, action, reactionType } = createPostLikeDto;

    if (reactionType && !this.allowedReactions.includes(reactionType)) {
      throw new Error(`Invalid reaction type: ${reactionType}`);
    }

    if (action === 'add') {
      return this.prisma.postLike.create({
        data: { postId, userId, reactionType: reactionType as ReactionType },
      });
    } else if (action === 'remove') {
      return this.prisma.postLike.deleteMany({
        where: { postId, userId },
      });
    } else if (action === 'update') {
      return this.prisma.postLike.updateMany({
        where: { postId, userId },
        data: { reactionType: reactionType as ReactionType },
      });
    } else {
      throw new Error('Invalid action');
    }
  }

  async findAll() {
    const postLikes = await this.prisma.postLike.findMany();
    if (!postLikes || postLikes.length === 0) {
      throw new Error('No post likes found');
    }
    return postLikes.map((postLike) => {
      return {
        id: postLike.id,
        postId: postLike.postId,
        userId: postLike.userId,
        reactionType: postLike.reactionType,
      };
    });
  }

  async findOne(id: string) {
    const postLike = await this.prisma.postLike.findUnique({
      where: { id: id.toString() },
    });
    if (!postLike) {
      throw new Error(`PostLike with id ${id} not found`);
    }
    return postLike;
  }

  async remove(id: string) {
    const postLike = await this.prisma.postLike.findUnique({
      where: { id: id.toString() },
    });
    if (!postLike) {
      throw new Error(`PostLike with id ${id} not found`);
    }
    return this.prisma.postLike.delete({
      where: { id: id.toString() },
    });
  }
}
