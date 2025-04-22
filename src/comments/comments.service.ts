import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { RoleEnum } from '../common/enums/role.enum';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    const { content, postId } = createCommentDto;

    const post = await this.prisma.post.findUnique({
      where: { postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        content,
        postId,
        userId,
      },
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

    return comment;
  }

  async update(commentId: string, userId: string, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({
      where: { commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new NotFoundException('You can only edit your own comments');
    }

    const updatedComment = await this.prisma.comment.update({
      where: { commentId },
      data: {
        content: updateCommentDto.content,
      },
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

    return updatedComment;
  }

  async delete(commentId: string, userId: string, role: string): Promise<{ message: string }> {
    const comment = await this.prisma.comment.findUnique({
      where: { commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId && role !== RoleEnum.ADMIN) {
      throw new NotFoundException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({
      where: { commentId },
    });
    return { message: 'Comment deleted successfully' };
  }

  async findById(commentId: string): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({
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

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }
}
