import { IsString, IsOptional, IsPhoneNumber, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(100)
  age?: number;
}
