import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserForAdminDto } from './dto/update-user.dto';
import { UpdateUserDto } from './dto/update-userForAdmin.dto';
import { ValidationService } from '../common/validation/validation.service';
import { MailService } from '../MailService/mail.service';
import { User } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponse } from './interfaces/profile.interface';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private validationService: ValidationService,
    private mailService: MailService
  ) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async getUser(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundException(`User with ID '${userId}' not found.`);
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = await this.prisma.user.create({ data: createUserDto });
    return newUser;
  }

  async updateUser<T extends UpdateUserDto | UpdateUserForAdminDto>(userId: string, updateDto: T): Promise<User> {
    const updatedUser = await this.prisma.user.update({ where: { userId }, data: { ...updateDto } });
    return updatedUser;
  }

  async deleteUser(userId: string): Promise<string> {
    await this.prisma.user.delete({ where: { userId } });
    return `User with ID ${userId} has been deleted successfully.`;
  }

  async toggleUserState(userId: string, state: 'approve' | 'deactivate'): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({ where: { userId } });

    if (!user) throw new NotFoundException(`User with ID ${userId} not found.`);

    const isActive = !user.active;

    await this.prisma.user.update({
      where: { userId },
      data: { active: isActive },
    });

    if (state === 'approve' && isActive && user.email) {
      await this.mailService.sendMail({
        to: user.email,
        subject: 'Account Activated',
        html: `
          <h1>Your Account Has Been Activated</h1>
          <p>Dear ${user.name},</p>
          <p>Your account has been successfully activated. You can now log in and use all features.</p>
          <p>Thank you for joining us!</p>
        `,
      });
    }

    return { message: `User with ID ${userId} has been ${isActive ? 'approved' : 'deactivated'} successfully.` };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    await this.validationService.validateUserExists(userId);

    if (updateProfileDto.phoneNumber) {
      const existingUser = await this.prisma.user.findUnique({
        where: { phoneNumber: updateProfileDto.phoneNumber },
      });
      if (existingUser && existingUser.userId !== userId) {
        throw new ConflictException('Phone number is already taken');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { userId },
      data: updateProfileDto,
    });

    return updatedUser;
  }

  async getUserProfile(userId: string): Promise<ProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        name: true,
        email: true,
        phoneNumber: true,
        country: true,
        age: true,
        type: true,
        address: true,
        active: true,
        profileImage: true,
        about: true,
        role: true,
        socialLinks: true,
        posts: {
          select: {
            postId: true,
            title: true,
            content: true,
            createdAt: true,
            images: true,
          },
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
        products: {
          select: {
            productId: true,
            name: true,
            price: true,
            currencyCode: true,
            images: true,
          },
          take: 5,
          // where: {
          //   active: true,
          // },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found.`);
    }

    return user;
  }

  async getUserSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        name: true,
        profileImage: true,
        industrySector: true,
        followers: true,
        following: true,
        posts: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      userId: userId,
      name: user.name,
      profileImage: user.profileImage,
      industry: user.industrySector,
      followers_count: user.followers.length,
      following_count: user.following.length,
      posts_count: user.posts.length,
    };
  }
}
