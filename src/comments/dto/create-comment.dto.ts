import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'post-id-123', description: 'ID of the post being commented on' })
  @IsNotEmpty({ message: 'Post ID is required' })
  @IsString()
  postId: string;

  @ApiProperty({ example: 'user-id-456', description: 'ID of the user making the comment' })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'This is a comment.', description: 'Content of the comment' })
  @IsNotEmpty({ message: 'Comment content is required' })
  @IsString()
  content: string;
}
