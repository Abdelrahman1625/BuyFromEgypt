import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'New Post Title', description: 'Title of the post' })
  @IsNotEmpty({ message: 'Post title is required' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Post content goes here', description: 'Content of the post' })
  @IsNotEmpty({ message: 'Post content is required' })
  @IsString()
  content: string;

  @ApiProperty({ type: [String], example: ['image1.png', 'image2.png'], description: 'List of image URLs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ type: [String], example: ['product-id-1', 'product-id-2'], description: 'List of product IDs' })
  @IsOptional()
  // @IsArray()
  @IsString({ each: true })
  products?: string[];
}
