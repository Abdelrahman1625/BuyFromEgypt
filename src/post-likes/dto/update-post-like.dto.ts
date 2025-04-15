import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePostLikeDto {
  @ApiPropertyOptional({ example: 'LIKE', description: 'Type of the reaction (LIKE, LOVE, HAHA, etc.)' })
  @IsOptional()
  @IsString()
  reactionType?: string;
}
