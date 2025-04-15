import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReactionType } from '@prisma/client';


export class CreatePostLikeDto {
  @ApiProperty({ example: 'postId', description: 'ID of the liked post' })
  @IsNotEmpty({ message: 'Post ID is required' })
  @IsString({ message: 'Post ID must be a string' })
  postId: string;

  @ApiProperty({ example: 'userId', description: 'ID of the user who liked the post' })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsString({ message: 'User ID must be a string' })
  userId: string;

  @ApiProperty({ example: 'add', description: 'Action to perform: add, remove, or update' })
  @IsNotEmpty({ message: 'Action is required' })
  @IsIn(['add', 'remove', 'update'], { message: 'Action must be either "add", "remove", or "update"' })
  @IsString({ message: 'Action must be a string' })
  action: 'add' | 'remove' | 'update';

  @ApiProperty({
    example: 'LIKE',
    description: 'Type of the reaction (LIKE, LOVE, HAHA, WOW, SAD, ANGRY)'
  })
  @IsOptional()
  @IsIn(Object.values(ReactionType), { message: 'Reaction type must be a valid value' })
  reactionType?: ReactionType;
}
