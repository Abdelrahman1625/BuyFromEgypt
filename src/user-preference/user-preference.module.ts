import { Module } from '@nestjs/common';
import { UserPreferenceService } from './user-preference.service';
import { UserPreferenceController } from './user-preference.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [UserPreferenceController],
  providers: [UserPreferenceService, PrismaService],
})
export class UserPreferenceModule {}
