import { Controller, Post, Body, Get, Param, Delete, Patch, HttpStatus } from '@nestjs/common';
import { PostLikesService } from './post-likes.service';
import { CreatePostLikeDto } from './dto/create-post-like.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('post-likes')
export class PostLikesController {
  constructor(private readonly postLikesService: PostLikesService) {}

  @Post()
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Post like created successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid data provided.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized action.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden action.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  create(@Body() createPostLikeDto: CreatePostLikeDto) {
    return this.postLikesService.create(createPostLikeDto);
  }

  @Get()
  @ApiResponse({ status: HttpStatus.OK, description: 'Post likes retrieved successfully.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized action.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden action.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post likes not found.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  findAll() {
    return this.postLikesService.findAll();
  }

  @Get(':id')
  @ApiResponse({ status: HttpStatus.OK, description: 'Post like retrieved successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid ID provided.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized action.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post like not found.' })
  findOne(@Param('id') id: string) {
    return this.postLikesService.findOne(id);
  }

  @Patch()
  @ApiResponse({ status: HttpStatus.OK, description: 'Post like updated successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid data provided.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized action.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden action.' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error.' })
  update(@Body() updatePostLikeDto: CreatePostLikeDto) {
    return this.postLikesService.create({ ...updatePostLikeDto, action: 'update' });
  }

  @Delete(':id')
  @ApiResponse({ status: HttpStatus.OK, description: 'Post like deleted successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid ID provided.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized action.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post like not found.' })
  remove(@Param('id') id: string) {
    return this.postLikesService.remove(id);
  }
}
