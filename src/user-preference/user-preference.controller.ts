import { Controller, Body, Post, Get, Req, UseGuards } from '@nestjs/common';
import { UserPreferenceService } from './user-preference.service';
import { UserPreferenceDto } from './dto/user-preference.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('user-preference')
@UseGuards(AuthGuard)
export class UserPreferenceController {
  constructor(private readonly userPreferenceService: UserPreferenceService) {}

  @Post()
  async upsert(@Req() req, @Body() dto: UserPreferenceDto) {
    return this.userPreferenceService.upsertPreference(req.user.userId, dto);
  }

  @Get('me')
  async getMine(@Req() req) {
    return this.userPreferenceService.getMyPreference(req.user.userId);
  }
}
