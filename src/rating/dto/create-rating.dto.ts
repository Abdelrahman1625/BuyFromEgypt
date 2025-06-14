import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsInt({ message: 'Rating value must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must not exceed 5' })
  @IsNotEmpty({ message: 'Rating value is required' })
  value: number;
}
