import { Controller, Post, Body, Get, Param, Delete, HttpStatus, UseGuards, UseInterceptors, UploadedFiles, Req, Put } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { PostTs } from './entities/post.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Post created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Please login to create a post' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  create(
    @UploadedFiles() files: Express.Multer.File[],
    @Req()
    req: Request & {
      user: { userId: string };
    },
    @Body() createPostDto: CreatePostDto
  ): Promise<PostTs> {
    return this.postsService.create(req.user.userId, createPostDto, files);
  }

  @Get()
  @ApiResponse({ status: HttpStatus.OK, description: 'Posts found successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Posts not found' })
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  @ApiResponse({ status: HttpStatus.OK, description: 'Post found successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post not found' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  @ApiResponse({ status: HttpStatus.OK, description: 'Post updated successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Please login to update a post' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  update(
    @Req()
    req: Request & { user: { userId: string }; },
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto
  ) {
    console.log(updatePostDto);
    return this.postsService.update(id, req.user.userId, updatePostDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiResponse({ status: HttpStatus.OK, description: 'Post deleted successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Please login to delete a post' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
  remove(
    @Req()
    req: Request & { user: { userId: string; role: string } },
    @Param('id') id: string
  ) {
    return this.postsService.remove(id, req.user.userId, req.user.role);
  }
}
