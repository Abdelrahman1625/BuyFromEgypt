import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CloudinaryService } from '../common/modules/cloudinary/cloudinary.service';
import { v4 as uuid } from 'uuid';
import { PostTs } from './entities/post.entity';
import { RoleEnum } from '../common/enums/role.enum';
import { PaginatedResponse } from '../common/interfaces/pagination.interface';
import { PaginationDto } from '../common/dto/pagination.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
    private readonly httpService: HttpService
  ) {}

  async create(userId: string, createPostDto: CreatePostDto, files: Express.Multer.File[]): Promise<PostTs> {
    const cloudFolder = `${process.env.SITE_NAME}/posts/${uuid()}`;
    try {
      let uploadedImages;

      if (files && files.length > 0) {
        try {
          uploadedImages = await this.cloudinaryService.uploadImages(files, cloudFolder);
        } catch (error) {
          throw new Error(`Failed to upload images: ${error.message}`);
        }
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
              profileImage: true,
            },
          },
          images: true,
          products: {
            select: {
              productId: true,
              name: true,
              description: true,
              price: true,
              owner: {
                select: {
                  userId: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      });

      return newPost;
    } catch (error) {
      if (cloudFolder) {
        try {
          await this.cloudinaryService.deleteFolder(cloudFolder);
        } catch (cleanupError) {
          console.error('Failed to clean up cloud folder:', cleanupError);
        }
      }

      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.code === 'P2002') {
        throw new Error(`A unique constraint would be violated: ${error.meta?.target}`);
      }
      if (error.code === 'P2025') {
        throw new Error(`Record not found: ${error.meta?.cause}`);
      }
      if (error.code === 'P2011') {
        throw new Error(`Null constraint violation: ${error.meta?.target}`);
      }

      throw new Error(error.message || 'Failed to create post');
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<PostTs>> {
    try {
      const page = Number(paginationDto.page) || 1;
      const limit = Number(paginationDto.limit) || 10;
      const skip = (page - 1) * limit;

      const userId = paginationDto && (paginationDto as any).userId ? (paginationDto as any).userId : undefined;
      if (userId && process.env.CHATBOT_API_URL) {
        try {
          const url = `${process.env.CHATBOT_API_URL}/api/v1/recommendation/posts?user_id=${userId}`;
          const { data } = await firstValueFrom(this.httpService.post(url, paginationDto));
          if (data && data.data && data.data.recommendations) {
            const paginated = data.data.recommendations.slice(skip, skip + limit);
            return {
              data: paginated,
              meta: {
                total: data.data.recommendations.length,
                page,
                limit,
                totalPages: Math.ceil(data.data.recommendations.length / limit),
                NextPage: page < Math.ceil(data.data.recommendations.length / limit),
                PreviousPage: page > 1,
              },
            };
          }
        } catch (err) {}
      }

      const [posts, total] = await Promise.all([
        this.prisma.post.findMany({
          skip,
          take: limit,
          include: {
            user: {
              select: {
                userId: true,
                name: true,
                profileImage: true,
              },
            },
            images: true,
            products: {
              select: {
                productId: true,
                name: true,
                description: true,
                price: true,
                owner: {
                  select: {
                    userId: true,
                    name: true,
                  },
                },
              },
            },
            comments: {
              select: {
                commentId: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.post.count(),
      ]);

      const mappedPosts = posts.map((post) => ({
        ...post,
        comments_count: post.comments.length,
        comments: undefined,
      }));

      return {
        data: mappedPosts,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          NextPage: page < Math.ceil(total / limit),
          PreviousPage: page > 1,
        },
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error(`A unique constraint would be violated: ${error.meta?.target}`);
      }
      if (error.code === 'P2025') {
        throw new Error(`Record not found: ${error.meta?.cause}`);
      }
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }
  }

  async findOne(postId: string) {
    try {
      const post = await this.prisma.post.findUnique({
        where: { postId },
        include: {
          user: {
            select: {
              userId: true,
              name: true,
              profileImage: true,
            },
          },
          images: true,
          products: {
            select: {
              productId: true,
              name: true,
              description: true,
              price: true,
            },
          },
          comments: {
            select: {
              commentId: true,
            },
          },
        },
      });

      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }

      return {
        ...post,
        comments_count: post.comments.length,
        comments: undefined,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch post: ${error.message}`);
    }
  }

  async update(postId: string, userId: string, updatePostDto: UpdatePostDto, files?: Express.Multer.File[]) {
    try {
      const post = await this.prisma.post.findUnique({
        where: { postId },
        include: {
          user: {
            select: {
              userId: true,
              name: true,
              profileImage: true,
            },
          },
          products: {
            select: {
              productId: true,
              name: true,
              description: true,
              price: true,
            },
          },
          images: true,
        },
      });

      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }

      if (post.userId !== userId) {
        throw new ForbiddenException("You don't have permission to update this post");
      }

      if (files && files.length > 0 && post.images.length > 0) {
        try {
          for (const image of post.images) {
            await this.cloudinaryService.deleteImage(image.id);
          }
          await this.prisma.postImage.deleteMany({
            where: { postId },
          });
        } catch (error) {
          throw new Error(`Failed to delete existing images: ${error.message}`);
        }
      }

      let uploadedImages;
      if (files && files.length > 0) {
        try {
          uploadedImages = await this.cloudinaryService.uploadImages(files, post.cloudFolder);
        } catch (error) {
          throw new Error(`Failed to upload images: ${error.message}`);
        }
      }

      const updateData: any = {};

      if (updatePostDto.title !== undefined) {
        updateData.title = updatePostDto.title;
      }
      if (updatePostDto.content !== undefined) {
        updateData.content = updatePostDto.content;
      }

      if (uploadedImages) {
        updateData.images = {
          create: uploadedImages.map((img: any) => ({
            url: img.url,
            id: img.id,
          })),
        };
      }

      const updatedPost = await this.prisma.post.update({
        where: { postId },
        data: updateData,
        include: {
          user: {
            select: {
              userId: true,
              name: true,
            },
          },
          images: true,
          products: {
            select: {
              productId: true,
              name: true,
              description: true,
              price: true,
            },
          },
        },
      });

      return updatedPost;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }

      if (error.code === 'P2002') {
        throw new Error(`A unique constraint would be violated: ${error.meta?.target}`);
      }
      if (error.code === 'P2025') {
        throw new Error(`Record not found: ${error.meta?.cause}`);
      }
      if (error.code === 'P2011') {
        throw new Error(`Null constraint violation: ${error.meta?.target}`);
      }

      throw new Error(error.message || 'Failed to update post');
    }
  }

  async remove(postId: string, userId: string, role: string): Promise<{ message: string }> {
    try {
      const post = await this.prisma.post.findUnique({
        where: { postId },
        include: {
          images: true,
        },
      });

      if (!post) {
        throw new NotFoundException(`Post with ID ${postId} not found`);
      }

      if (post.userId !== userId && role !== RoleEnum.ADMIN) {
        throw new ForbiddenException("You don't have permission to delete this post");
      }

      if (post.images && post.images.length > 0) {
        for (const image of post.images) {
          try {
            await this.cloudinaryService.deleteImage(image.id);
          } catch (error) {
            console.log(`Image ${image.id} not found in Cloudinary, continuing with deletion`);
          }
        }
      }

      if (post.cloudFolder) {
        try {
          await this.cloudinaryService.deleteFolder(post.cloudFolder);
        } catch (error) {
          console.log(`Folder ${post.cloudFolder} not found in Cloudinary, continuing with deletion`);
        }
      }

      await this.prisma.$transaction(async (prisma) => {
        await prisma.commentLike.deleteMany({
          where: {
            comment: {
              postId,
            },
          },
        });

        await prisma.comment.deleteMany({
          where: { postId },
        });

        await prisma.postImage.deleteMany({
          where: { postId },
        });

        await prisma.post.delete({
          where: { postId },
        });
      });

      return {
        message: `Post with ID ${postId} has been deleted successfully.`,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error(`Failed to delete post: ${error.message}`);
    }
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
