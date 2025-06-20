import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Follow } from './entities/follow.entity';
import { ValidationService } from '../common/validation/validation.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../common/enums/Notification.enum';

@Injectable()
export class FollowService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
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

      await this.prisma.notification.deleteMany({
        where: {
          type: NotificationType.FOLLOW_USER,
          senderId: followerId,
          recipientId: followingId,
        },
      });

      return {
        message: `User ${followerId} has unfollowed user ${followingId}.`,
      };
    }

    const follow = await this.prisma.follower.create({
      data: { followerId, followingId },
      include: { follower: true, following: true },
    });

    await this.notificationService.createAndSend({
      type: NotificationType.FOLLOW_USER,
      senderId: followerId,
      recipientId: followingId,
      data: {},
    });

    return {
      message: `User ${followerId} is now following user ${followingId}.`,
      follow: {
        id: follow.followId,
        follower: follow.follower,
        following: follow.following,
        createdAt: follow.createdAt,
      },
    };
  }

  async getFollowers(userId: string): Promise<Follow[]> {
    await this.validationService.validateUserExists(userId);
    return this.prisma.follower
      .findMany({
        where: { followingId: userId },
        select: { followId: true, follower: true, following: true, createdAt: true },
      })
      .then((follows) =>
        follows.map((follow) => ({
          id: follow.followId,
          follower: follow.follower,
          createdAt: follow.createdAt,
        }))
      );
  }

  async getFollowing(userId: string): Promise<Follow[]> {
    await this.validationService.validateUserExists(userId);
    return this.prisma.follower
      .findMany({
        where: { followerId: userId },
        select: { followId: true, follower: true, following: true, createdAt: true },
      })
      .then((follows) =>
        follows.map((follow) => ({
          id: follow.followId,
          following: follow.following,
          createdAt: follow.createdAt,
        }))
      );
  }
}
