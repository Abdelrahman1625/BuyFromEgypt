import { IsNotEmpty, IsOptional, IsString, IsNumber, ValidateNested, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ProductImage } from '../entities/productImage.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Premium Laptop' })
  @IsNotEmpty({ message: 'Product name is required' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'High-performance laptop' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1299.99 })
  @IsNotEmpty({ message: 'Product price is required' })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @ApiProperty({ example: 'EGP' })
  @IsNotEmpty({ message: 'Currency code is required' })
  @IsString()
  currencyCode: string;

  @ApiProperty({ example: 'cat_123', })
  @IsNotEmpty({ message: 'Category ID is required' })
  @IsString({ message: 'Category ID must be a string' })
  categoryId: string;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @ApiProperty({ type: [ProductImage], description: 'List of product images' })
  @IsOptional({ message: 'Product images are optional' })
  @ValidateNested({ each: true })
  @Type(() => ProductImage)
  images?: ProductImage[];
}
