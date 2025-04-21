import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { PostTs } from '../../posts/entities/post.entity';

export class PostLikeResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the like',
    example: 'clnjak9xj000008jk7v5jgk9v',
  })
  postLikeId: string;

  @ApiProperty({
    description: 'ID of the user who liked the post',
    example: 'clnjak9xj000008jk7v5jgk9v',
  })
  userId: string;

  @ApiProperty({
    description: 'ID of the post that was liked',
    example: 'clnjak9xj000008jk7v5jgk9v',
  })
  postId: string;

  @ApiProperty({
    description: 'Timestamp when the like was created',
    example: '2023-05-15T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User details of who liked the post',
    type: () => User,
  })
  user?:User ;

  @ApiProperty({
    description: 'Post details (only present in user likes endpoint)',
    // type: () =>PostTs,
    required: false,
  })
  post?: PostTs;
}


