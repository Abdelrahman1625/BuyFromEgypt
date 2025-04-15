import { Controller, Post, Body, Get, Param, Delete, Patch, HttpStatus } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiResponse({status : HttpStatus.CREATED, description: 'Post created successfully'})
  @ApiResponse({status : HttpStatus.BAD_REQUEST, description: 'Bad request'})
  @ApiResponse({status : HttpStatus.UNAUTHORIZED, description: 'Please login to create a post'})
  @ApiResponse({status : HttpStatus.FORBIDDEN, description: 'Forbidden'})
  @ApiResponse({status : HttpStatus.NOT_FOUND, description: 'User not found'})
  @ApiResponse({status : HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error'})
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get(':id')
  @ApiResponse({status : HttpStatus.OK, description: 'Post found successfully'})
  @ApiResponse({status : HttpStatus.BAD_REQUEST, description: 'Bad request'})
  @ApiResponse({status : HttpStatus.NOT_FOUND, description: 'Post not found'})
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Get()
  @ApiResponse({status : HttpStatus.OK, description: 'Posts found successfully'})
  @ApiResponse({status : HttpStatus.BAD_REQUEST, description: 'Bad request'})
  @ApiResponse({status : HttpStatus.NOT_FOUND, description: 'Posts not found'})
  findAll() {
    return this.postsService.findAll();
  }

  @Delete(':id')
  @ApiResponse({status : HttpStatus.OK, description: 'Post deleted successfully'})
  @ApiResponse({status : HttpStatus.BAD_REQUEST, description: 'Bad request'})
  @ApiResponse({status : HttpStatus.NOT_FOUND, description: 'Post not found'})
  @ApiResponse({status : HttpStatus.UNAUTHORIZED, description: 'Please login to delete a post'})
  @ApiResponse({status : HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error'})
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }

  @Patch(':id')
  @ApiResponse({status : HttpStatus.OK, description: 'Post updated successfully'})
  @ApiResponse({status : HttpStatus.BAD_REQUEST, description: 'Bad request'})
  @ApiResponse({status : HttpStatus.NOT_FOUND, description: 'Post not found'})
  @ApiResponse({status : HttpStatus.UNAUTHORIZED, description: 'Please login to update a post'})
  @ApiResponse({status : HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error'})
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }
}
