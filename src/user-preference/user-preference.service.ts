import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserPreferenceDto } from './dto/user-preference.dto';

@Injectable()
export class UserPreferenceService {
  constructor(private prisma: PrismaService) {}

  async upsertPreference(userId: string, dto: UserPreferenceDto) {
    return this.prisma.userPreference.upsert({
      where: { userId },
      update: { ...dto },
      create: { userId, ...dto },
    });
  }

  async getMyPreference(userId: string) {
    return this.prisma.userPreference.findUnique({
      where: { userId },
    });
  }
}
