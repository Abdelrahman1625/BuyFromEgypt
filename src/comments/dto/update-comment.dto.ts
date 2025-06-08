import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({
    example: 'Updated comment content',
  })
  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  content: string;
}
