import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req, Request } from '@nestjs/common';
import { FollowService } from './follow.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { FollowUserDto } from './dto/followUser.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post()
  @UseGuards(AuthGuard)
  async followUser(@Req() req: AuthenticatedRequest, @Body() followUserDto: FollowUserDto) {
    return this.followService.followUser(req.user.userId, followUserDto.followingId);
  }

  @Get('followers/:userId')
  async getFollowers(@Param('userId') userId: string) {
    return this.followService.getFollowers(userId);
  }

  @Get('following/:userId')
  async getFollowing(@Param('userId') userId: string) {
    return this.followService.getFollowing(userId);
  }

  @Get('followers')
  @UseGuards(AuthGuard)
  async getCurrentUserFollowers(@Req() req: AuthenticatedRequest) {
    return this.followService.getFollowers(req.user.userId);
  }

  @Get('following')
  @UseGuards(AuthGuard)
  async getCurrentUserFollowing(@Req() req: AuthenticatedRequest) {
    return this.followService.getFollowing(req.user.userId);
  }
}
