import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CloudinaryService } from '../common/modules/cloudinary/cloudinary.service';
import { v4 as uuid } from 'uuid';
import { PostTs } from './entities/post.entity';
import { RoleEnum } from '../common/enums/role.enum';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService
  ) {}

  async create(userId: string, createPostDto: CreatePostDto, files: Express.Multer.File[]): Promise<PostTs> {
    try {
      const cloudFolder = `${process.env.SITE_NAME}/posts/${uuid()}`;
      let uploadedImages;

      if (files && files.length > 0) {
        uploadedImages = await this.cloudinaryService.uploadImages(files, cloudFolder);
      }

      const productIds = Array.isArray(createPostDto.products) ? createPostDto.products : createPostDto.products ? [createPostDto.products] : [];

      if (productIds.length > 0) {
        const products = await this.prisma.product.findMany({
          where: {
            productId: {
              in: productIds,
            },
          },
          select: {
            productId: true,
          },
        });

        if (products.length !== productIds.length) {
          const foundIds = products.map((p) => p.productId);
          const missingIds = productIds.filter((id) => !foundIds.includes(id));
          throw new NotFoundException(`Products with IDs ${missingIds.join(', ')} not found`);
        }
      }

      const postData = {
        ...createPostDto,
        userId,
        cloudFolder,
        images: uploadedImages
          ? {
              create: uploadedImages.map((img: any) => ({
                url: img.url,
                id: img.id,
              })),
            }
          : undefined,
        products:
          productIds.length > 0
            ? {
                connect: productIds.map((productId) => ({ productId })),
              }
            : undefined,
      };

      const newPost = await this.prisma.post.create({
        data: postData,
        include: {
          user: {
            select: {
              userId: true,
              name: true,
              email: true,
              role: true,
              isOnline: true,
            },
          },
          images: true,
          products: true,
        },
      });

      return newPost;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to create post: ${error.message}`);
    }
  }

  async findAll() {
    const posts = await this.prisma.post.findMany({
      include: {},
      orderBy: {
        createdAt: 'asc',
      },
    });
    return posts;
  }

  async findOne(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { postId },
      include: {},
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    return post;
  }

  async update(postId: string, userId: string, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { postId },
      include: { user: true, products: true },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    if (post.userId !== userId) {
      throw new ForbiddenException("You don't have permission to update this post");
    }

    console.log(updatePostDto);

    const updatedPost = this.prisma.post.update({
      where: { postId },
      data: { title: updatePostDto.title, content: updatePostDto.content },
    });
    return updatedPost;
  }

  async remove(postId: string, userId: string, role: string): Promise<{ message: string }> {
    const post = await this.prisma.post.findUnique({
      where: { postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    if (post.userId !== userId && role !== RoleEnum.ADMIN) {
      throw new ForbiddenException("You don't have permission to delete this post");
    }

    await this.prisma.$transaction([
      this.prisma.commentLike.deleteMany({
        where: {
          comment: {
            postId,
          },
        },
      }),
      this.prisma.comment.deleteMany({ where: { postId } }),
      this.prisma.postImage.deleteMany({ where: { postId } }),
      this.prisma.post.delete({ where: { postId } }),
    ]);

    return {
      message: `Post with ID ${postId} has been deleted successfully.`,
    };
  }

  async savePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const savedPost = await this.prisma.savedPost.create({
      data: {
        userId,
        postId,
      },
      include: {
        post: {
          include: {
            user: {
              select: {
                userId: true,
                name: true,
                email: true,
                role: true,
                isOnline: true,
              },
            },
            images: true,
            products: {
              select: {
                productId: true,
                name: true,
                description: true,
                active: true,
                rating: true,
                categoryId: true,
                approvedById: true,
              },
            },
          },
        },
      },
    });

    return savedPost;
  }

  async unsavePost(postId: string, userId: string) {
    const savedPost = await this.prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (!savedPost) {
      throw new NotFoundException('Post is not saved');
    }

    await this.prisma.savedPost.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    return { message: 'Post unsaved successfully' };
  }

  async getSavedPosts(userId: string) {
    const savedPosts = await this.prisma.savedPost.findMany({
      where: {
        userId,
      },
      include: {
        post: {
          include: {
            user: {
              select: {
                userId: true,
                name: true,
                email: true,
                role: true,
                isOnline: true,
              },
            },
            images: true,
            products: {
              select: {
                productId: true,
                name: true,
                description: true,
                active: true,
                rating: true,
                categoryId: true,
                approvedById: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return savedPosts.map((savedPost) => savedPost.post);
  }

  async getPostSummery(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { postId },
      select: {
        postId: true,
        title: true,
        content: true,
        cloudFolder: true,
        createdAt: true,
        rating: true,
        comments: {
          select: { commentId: true },
        },
        user: {
          select: {
            userId: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    return {
      postId: post.postId,
      title: post.title,
      content: post.content,
      cloudFolder: post.cloudFolder,
      user: {
        id: post.user.userId,
        name: post.user.name,
        profileImage: post.user.profileImage,
      },
      rate: post.rating ?? 0,
      comments_count: post.comments.length,
      createdAt: post.createdAt,
    };
  }
}
