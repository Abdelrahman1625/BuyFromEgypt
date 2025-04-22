import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'post-id-123', description: 'ID of the post being commented on' })
  @IsNotEmpty({ message: 'Post ID is required' })
  @IsString()
  postId: string;

  @ApiProperty({ example: 'This is a comment.', description: 'Content of the comment' })
  @IsNotEmpty({ message: 'Comment content is required' })
  @IsString()
  content: string;
}
