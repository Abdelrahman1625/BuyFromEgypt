import { Controller, Post, Delete, Get, Param, Req, UseGuards, HttpStatus } from '@nestjs/common';
import { PostLikesService } from './post-likes.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { PostLikeResponseDto } from './dto/post-like-response.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

@ApiTags('Post Likes')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('posts')
export class PostLikesController {
  constructor(private readonly postLikesService: PostLikesService) {}

  @Post(':postId/likes')
  @ApiOperation({ summary: 'Like a post' })
  @ApiParam({ name: 'postId', description: 'ID of the post to like' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Post liked successfully',
    type: PostLikeResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Please login to like a post' })
  async likePost(@Req() req: AuthenticatedRequest, @Param('postId') postId: string) {
    return this.postLikesService.likePost(req.user.userId, postId);
  }

  @Delete(':postId/likes')
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiParam({ name: 'postId', description: 'ID of the post to unlike' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Post unliked successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Please login to unlike a post' })
  async unlikePost(@Req() req: AuthenticatedRequest, @Param('postId') postId: string) {
    return this.postLikesService.unlikePost(req.user.userId, postId);
  }

  @Get(':postId/likes')
  @ApiOperation({ summary: 'Get all likes for a post' })
  @ApiParam({ name: 'postId', description: 'ID of the post' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of post likes',
    type: [PostLikeResponseDto],
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post not found' })
  async getPostLikes(@Param('postId') postId: string) {
    return this.postLikesService.getPostLikes(postId);
  }

  @Get(':postId/likes/count')
  @ApiOperation({ summary: 'Get count of likes for a post' })
  @ApiParam({ name: 'postId', description: 'ID of the post' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Number of likes',
    type: Number,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Post not found' })
  async countLikes(@Param('postId') postId: string) {
    return this.postLikesService.countLikes(postId);
  }
}
