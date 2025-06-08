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
          user: true,
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
      include: { comments: true, likes: true, user: true, images: true, products: true },
    });
    return posts;
  }

  async findOne(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { postId },
      include: { comments: true, likes: true },
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
      this.prisma.comment.deleteMany({ where: { postId } }),
      this.prisma.postImage.deleteMany({ where: { postId } }),
      this.prisma.postLike.deleteMany({ where: { postId } }),
      this.prisma.post.delete({ where: { postId } }),
    ]);

    return {
      message: `Post with ID ${postId} has been deleted successfully.`,
    };
  }
}
