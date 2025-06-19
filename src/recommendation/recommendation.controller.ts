import { Controller, Post, Body, Query } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationRequestDto } from './dto/recommendation-request.dto';
import { ApiTags, ApiOperation, ApiQuery, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Recommendation')
@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Post('products')
  @ApiOperation({ summary: 'Get personalized product recommendations' })
  @ApiQuery({ name: 'user_id', required: false, type: String, description: 'User ID for personalized recommendations' })
  @ApiBody({ type: RecommendationRequestDto })
  @ApiResponse({ status: 200, description: 'Product recommendations generated successfully' })
  async recommendProducts(@Query('user_id') userId: string, @Body() dto: RecommendationRequestDto) {
    return this.recommendationService.getRecommendations(userId, dto, 'product');
  }

  @Post('posts')
  @ApiOperation({ summary: 'Get personalized post recommendations' })
  @ApiQuery({ name: 'user_id', required: false, type: String, description: 'User ID for personalized recommendations' })
  @ApiBody({ type: RecommendationRequestDto })
  @ApiResponse({ status: 200, description: 'Post recommendations generated successfully' })
  async recommendPosts(@Query('user_id') userId: string, @Body() dto: RecommendationRequestDto) {
    return this.recommendationService.getRecommendations(userId, dto, 'post');
  }
}
