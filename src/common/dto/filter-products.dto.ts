import { IsOptional, IsNumber, Min, Max, IsBoolean, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortField {
  PRICE = 'price',
  RATING = 'rating',
  CREATED_AT = 'createdAt',
  NAME = 'name',
}

export class FilterProductsDto extends PaginationDto {
  @ApiProperty({ required: false, description: 'Minimum price filter' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ required: false, description: 'Maximum price filter' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ required: false, description: 'Minimum rating filter (0-5)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiProperty({ required: false, description: 'Filter products in stock' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  available?: boolean;

  @ApiProperty({ required: false, description: 'Filter active products' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;

  @ApiProperty({ required: false, description: 'Filter by category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ required: false, description: 'Filter by currency code (e.g., USD, EGP)' })
  @IsOptional()
  @IsString()
  currencyCode?: string;

  @ApiProperty({ required: false, enum: SortField, description: 'Field to sort by' })
  @IsOptional()
  @IsEnum(SortField)
  sortBy?: SortField;

  @ApiProperty({ required: false, enum: SortOrder, description: 'Sort order (asc/desc)' })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiProperty({ required: false, description: 'User ID for recommendations' })
  @IsOptional()
  @IsString()
  userId?: string;
}
