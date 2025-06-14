import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSocialMediaDto } from './dto/create-social-media.dto';
import { UpdateSocialMediaDto } from './dto/update-social-media.dto';

@Injectable()
export class SocialMediaService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createSocialMediaDto: CreateSocialMediaDto) {
    return this.prisma.socialMedia.create({
      data: {
        ...createSocialMediaDto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.socialMedia.findMany({
      where: { userId },
    });
  }

  async findOne(id: string) {
    const socialMedia = await this.prisma.socialMedia.findUnique({
      where: { id },
    });

    if (!socialMedia) {
      throw new NotFoundException(`Social media with ID ${id} not found`);
    }

    return socialMedia;
  }

  async update(id: string, updateSocialMediaDto: UpdateSocialMediaDto) {
    try {
      return await this.prisma.socialMedia.update({
        where: { id },
        data: updateSocialMediaDto,
      });
    } catch (error) {
      throw new NotFoundException(`Social media with ID ${id} not found`);
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.socialMedia.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Social media with ID ${id} not found`);
    }
  }

  async removeAll(userId: string) {
    try {
      const result = await this.prisma.socialMedia.deleteMany({
        where: { userId },
      });
      return {
        message: `Successfully deleted ${result.count} social media links`,
        count: result.count,
      };
    } catch (error) {
      throw new NotFoundException(`Error deleting social media links for user ${userId}`);
    }
  }

  async findByPlatform(userId: string, platform: string) {
    return this.prisma.socialMedia.findFirst({
      where: {
        userId,
        platform,
      },
    });
  }
}
