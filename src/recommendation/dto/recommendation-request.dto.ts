import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class RecommendationRequestDto {
  @ApiProperty({ type: [String], required: false, description: 'Preferred industries (Categories)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferred_industries?: string[];

  @IsOptional()
  @IsString()
  preferred_supplier_type?: string;

  @IsOptional()
  @IsString()
  business_size?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsString()
  price_range?: string;
}
