import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommentLikesService {
  constructor(private prisma: PrismaService) {}

  private async validateComment(commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  private async getExistingReaction(userId: string, commentId: string) {
    return this.prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });
  }

  private getUserSelect() {
    return {
      userId: true,
      name: true,
      profileImage: true,
    };
  }

  async likeComment(userId: string, commentId: string) {
    await this.validateComment(commentId);
    const existingReaction = await this.getExistingReaction(userId, commentId);

    if (existingReaction) {
      if (existingReaction.isDislike) {
        return this.prisma.commentLike.update({
          where: {
            userId_commentId: {
              userId,
              commentId,
            },
          },
          data: {
            isDislike: false,
          },
          select: {
            user: {
              select: this.getUserSelect(),
            },
            comment: true,
          },
        });
      } else {
        return this.removeReaction(userId, commentId);
      }
    }

    return this.prisma.commentLike.create({
      data: {
        userId,
        commentId,
        isDislike: false,
      },
      select: {
        user: {
          select: this.getUserSelect(),
        },
        comment: true,
      },
    });
  }

  async dislikeComment(userId: string, commentId: string) {
    await this.validateComment(commentId);
    const existingReaction = await this.getExistingReaction(userId, commentId);

    if (existingReaction) {
      if (!existingReaction.isDislike) {
        return this.prisma.commentLike.update({
          where: {
            userId_commentId: {
              userId,
              commentId,
            },
          },
          data: {
            isDislike: true,
          },
          select: {
            user: {
              select: this.getUserSelect(),
            },
            comment: true,
          },
        });
      } else {
        return this.removeReaction(userId, commentId);
      }
    }

    return this.prisma.commentLike.create({
      data: {
        userId,
        commentId,
        isDislike: true,
      },
      select: {
        user: {
          select: this.getUserSelect(),
        },
        comment: true,
      },
    });
  }

  async removeReaction(userId: string, commentId: string) {
    return this.prisma.commentLike.delete({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });
  }

  async getCommentReactions(commentId: string) {
    await this.validateComment(commentId);
    return this.prisma.commentLike.findMany({
      where: { commentId },
      select: {
        user: {
          select: this.getUserSelect(),
        },
      },
    });
  }

  async getCommentLikesCount(commentId: string) {
    await this.validateComment(commentId);
    return this.prisma.commentLike.count({
      where: {
        commentId,
        isDislike: false,
      },
    });
  }

  async getCommentDislikesCount(commentId: string) {
    await this.validateComment(commentId);
    return this.prisma.commentLike.count({
      where: {
        commentId,
        isDislike: true,
      },
    });
  }
}
