import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserForAdminDto } from './dto/update-user.dto';
import { UpdateUserDto } from './dto/update-userForAdmin.dto';
import { ValidationService } from '../common/validation/validation.service';
import { MailService } from '../MailService/mail.service';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';
import { CreateSocialMediaDto } from './dto/create-social-media.dto';
import { User, SocialMedia } from '@prisma/client';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponse } from './interfaces/profile.interface';

type UserWithSocialMedia = User & {
  socialMedia?: SocialMedia | null;
};

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private validationService: ValidationService,
    private mailService: MailService
  ) {}

  private async validateUserExists(userId: string, includeSocialMedia = false): Promise<UserWithSocialMedia> {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      include: includeSocialMedia ? { socialMedia: true } : undefined,
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found.`);
    }

    return user as UserWithSocialMedia;
  }

  private validateSocialMediaUrls(data: { instagram?: string; facebook?: string; tiktok?: string; xUrl?: string }) {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    const tiktokPattern = /^(https?:\/\/)?(www\.)?(tiktok\.com|vm\.tiktok\.com)\/(@[\w.-]+|\w+)(\/video\/\d+)?\/?$/;
    const instagramPattern = /^(https?:\/\/)?(www\.)?(instagram\.com|instagram)\/([A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)\/?$/;
    const facebookPattern = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/([A-Za-z0-9.]+)\/?$/;
    const xPattern = /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/([A-Za-z0-9_]+)\/?$/;

    if (data.instagram && !instagramPattern.test(data.instagram)) {
      throw new BadRequestException('Invalid Instagram URL format. Example: https://instagram.com/username');
    }
    if (data.facebook && !facebookPattern.test(data.facebook)) {
      throw new BadRequestException('Invalid Facebook URL format. Example: https://facebook.com/username');
    }
    if (data.tiktok && !tiktokPattern.test(data.tiktok)) {
      throw new BadRequestException('Invalid TikTok URL format. Example: https://tiktok.com/@username');
    }
    if (data.xUrl && !xPattern.test(data.xUrl)) {
      throw new BadRequestException('Invalid X (Twitter) URL format. Example: https://twitter.com/username');
    }
  }

  private validateWhatsAppNumber(number?: string) {
    if (number) {
      const whatsappPattern = /^\+?[1-9]\d{1,14}$/;
      if (!whatsappPattern.test(number)) {
        throw new BadRequestException('Invalid WhatsApp number format');
      }
    }
  }

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

  async updateSocialMedia(userId: string, updateDto: UpdateSocialMediaDto): Promise<Partial<User>> {
    try {
      await this.validateUserExists(userId, true);

      this.validateSocialMediaUrls(updateDto);
      this.validateWhatsAppNumber(updateDto.whatsappNumber);

      return this.prisma.$transaction(async (prisma) => {
        try {
          const updatedUser = await prisma.user.update({
            where: { userId },
            data: {
              socialMedia: {
                upsert: {
                  create: {
                    ...updateDto,
                  },
                  update: {
                    ...updateDto,
                  },
                },
              },
            },
            select: {
              userId: true,
              email: true,
              socialMedia: true,
            },
          });

          return updatedUser;
        } catch (error) {
          throw new BadRequestException({
            message: 'Failed to update social media information',
            error: error.message,
          });
        }
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException({
        message: 'Failed to update social media',
        error: error.message,
      });
    }
  }

  async deleteSocialMedia(userId: string): Promise<ProfileResponse> {
    await this.validateUserExists(userId, true);

    return this.prisma.$transaction(async (prisma) => {
      try {
        await prisma.socialMedia.deleteMany({
          where: { userId },
        });

        const updatedUser = await prisma.user.findUnique({
          where: { userId },
          include: {
            socialMedia: true,
          },
        });

        if (!updatedUser) {
          throw new NotFoundException(`User with ID '${userId}' not found.`);
        }

        return updatedUser;
      } catch (error) {
        throw new BadRequestException({
          message: 'Failed to delete social media information',
          error: error.message,
        });
      }
    });
  }

  async getSocialMedia(userId: string): Promise<ProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { userId },
      include: {
        socialMedia: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found.`);
    }

    return user;
  }

  async createSocialMedia(userId: string, createDto: CreateSocialMediaDto): Promise<Partial<User>> {
    const user = await this.validateUserExists(userId, true);

    if (user.socialMedia) {
      throw new ConflictException('Social media information already exists for this user. Use update instead.');
    }

    this.validateSocialMediaUrls(createDto);
    this.validateWhatsAppNumber(createDto.whatsappNumber);

    return this.prisma.$transaction(async (prisma) => {
      try {
        const updatedUser = await prisma.user.update({
          where: { userId },
          data: {
            socialMedia: {
              create: {
                ...createDto,
              },
            },
          },
          select: {
            userId: true,
            email: true,
            socialMedia: true,
          },
        });

        return updatedUser;
      } catch (error) {
        throw new BadRequestException({
          message: 'Failed to create social media information',
          error: error.message,
        });
      }
    });
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    await this.validateUserExists(userId);

    if (updateProfileDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateProfileDto.email },
      });
      if (existingUser && existingUser.userId !== userId) {
        throw new ConflictException('Email is already taken');
      }
    }

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
      include: {
        socialMedia: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' not found.`);
    }

    return user;
  }
}
