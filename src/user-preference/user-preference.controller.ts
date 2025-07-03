import { Controller, Body, Post, Get, Req, UseGuards } from '@nestjs/common';
import { UserPreferenceService } from './user-preference.service';
import { UserPreferenceDto } from './dto/user-preference.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('user-preference')
export class UserPreferenceController {
  constructor(private readonly userPreferenceService: UserPreferenceService) {}

  @Post()
  async upsert(@Body() dto: UserPreferenceDto) {
    return this.userPreferenceService.upsertPreference(dto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getMine(@Req() req: Request & { user: { userId: string } }) {
    return this.userPreferenceService.getMyPreference(req.user.userId);
  }
}
