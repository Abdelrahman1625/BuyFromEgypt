import { ApiProperty } from '@nestjs/swagger';

export class CommentLikeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  commentId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  user: {
    userId: string;
    name: string;
    profileImage: string | null;
  };

  @ApiProperty()
  comment: {
    commentId: string;
    content: string;
    postId: string;
  };
}
