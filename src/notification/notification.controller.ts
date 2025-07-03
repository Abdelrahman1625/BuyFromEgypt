import { Controller, Get, Param, ParseUUIDPipe, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getUserNotifications(@Req() req: Request & { user: { userId: string } }) {
    return this.notificationService.getMyNotifications(req.user.userId);
  }
}
