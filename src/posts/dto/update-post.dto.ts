import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdatePostDto {
  @IsOptional({message: 'Post title is required'})
  @IsString({message: 'Post title must be a string'})
  title?: string;

  @IsOptional({message: 'Post content is required'})
  @IsString({message: 'Post content must be a string'})
  content?: string;

  @IsOptional({message: 'Post status is required'})
  @IsArray()
  images?: string[];

  @IsOptional({message: 'Post status is required'})
  @IsArray()
  productIds?: string[];
}
