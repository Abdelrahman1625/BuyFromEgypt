import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Follow } from './entities/follow.entity';
import { ValidationService } from '../common/validation/validation.service';

@Injectable()
export class FollowService {
  constructor(
    private prisma: PrismaService,
    private readonly validationService: ValidationService
  ) {}

  async followUser(followerId: string, followingId: string): Promise<{ message: string; follow?: Follow }> {
    if (followerId === followingId) {
      throw new ConflictException('You cannot follow yourself');
    }

    await this.validationService.validateUserExists(followingId);

    const existingFollow = await this.prisma.follower.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });

    if (existingFollow) {
      await this.prisma.follower.delete({
        where: { followerId_followingId: { followerId, followingId } },
      });
      return { message: `User ${followerId} has unfollowed user ${followingId}.` };
    }

    const follow = await this.prisma.follower.create({
      data: { followerId, followingId },
      include: { follower: true, following: true },
    });

    return {
      message: `User ${followerId} is now following user ${followingId}.`,
      follow: { id: follow.followId, follower: follow.follower, following: follow.following, createdAt: follow.createdAt }, // Explicitly include 'id'
    };
  }

  async getFollowers(userId: string): Promise<Follow[]> {
    await this.validationService.validateUserExists(userId);
    return this.prisma.follower
      .findMany({
        where: { followingId: userId },
        select: { followId: true, follower: true, following: true, createdAt: true }, // Explicitly select 'id' (renamed to 'followId')
      })
      .then((follows) =>
        follows.map((follow) => ({
          id: follow.followId,
          follower: follow.follower,
          following: follow.following,
          createdAt: follow.createdAt,
        }))
      );
  }

  async getFollowing(userId: string): Promise<Follow[]> {
    await this.validationService.validateUserExists(userId);
    return this.prisma.follower
      .findMany({
        where: { followerId: userId },
        select: { followId: true, follower: true, following: true, createdAt: true }, // Explicitly select 'id' (renamed to 'followId')
      })
      .then((follows) =>
        follows.map((follow) => ({
          id: follow.followId,
          follower: follow.follower,
          following: follow.following,
          createdAt: follow.createdAt,
        }))
      );
  }
}
