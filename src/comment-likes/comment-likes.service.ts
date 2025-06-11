import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommentLikesService {
  constructor(private prisma: PrismaService) {}

  async likeComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const existingReaction = await this.prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

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
          include: {
            user: {
              select: {
                userId: true,
                name: true,
                profileImage: true,
              },
            },
            comment: true,
          },
        });
      } else {
        // If it was already a like, remove it
        return this.removeLike(userId, commentId);
      }
    }

    // Create new like
    return this.prisma.commentLike.create({
      data: {
        userId,
        commentId,
        isDislike: false,
      },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            profileImage: true,
          },
        },
        comment: true,
      },
    });
  }

  async dislikeComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const existingReaction = await this.prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    if (existingReaction) {
      if (!existingReaction.isDislike) {
        // If it was a like, change it to a dislike
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
          include: {
            user: {
              select: {
                userId: true,
                name: true,
                profileImage: true,
              },
            },
            comment: true,
          },
        });
      } else {
        // If it was already a dislike, remove it
        return this.removeDislike(userId, commentId);
      }
    }

    // Create new dislike
    return this.prisma.commentLike.create({
      data: {
        userId,
        commentId,
        isDislike: true,
      },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            profileImage: true,
          },
        },
        comment: true,
      },
    });
  }

  async removeLike(userId: string, commentId: string) {
    return this.prisma.commentLike.delete({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });
  }

  async removeDislike(userId: string, commentId: string) {
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
    const comment = await this.prisma.comment.findUnique({
      where: { commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.prisma.commentLike.findMany({
      where: { commentId },
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

  async getCommentLikesCount(commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.prisma.commentLike.count({
      where: {
        commentId,
        isDislike: false,
      },
    });
  }

  async getCommentDislikesCount(commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.prisma.commentLike.count({
      where: {
        commentId,
        isDislike: true,
      },
    });
  }
}
