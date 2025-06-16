import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { RateableEntity, RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @UseGuards(AuthGuard)
  @Post(':entityType/:entityId')
  async rateEntity(
    @Param('entityType') entityType: RateableEntity,
    @Param('entityId') entityId: string,
    @Body() createRatingDto: CreateRatingDto,
    @Req()
    req: Request & {
      user: { userId: string };
    }
  ) {
    return this.ratingService.rate(entityType, {
      userId: req.user.userId,
      entityId,
      value: createRatingDto.value,
      comment: createRatingDto.comment || '',
    });
  }
}
