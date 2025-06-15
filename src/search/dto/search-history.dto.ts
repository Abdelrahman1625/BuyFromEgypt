import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateSearchHistoryDto {
  @ApiProperty({ description: 'The search query' })
  @IsString()
  query: string;

  @ApiProperty({ description: 'The type of search (users, products, messages)' })
  @IsString()
  type: string;
}

export class GetSearchHistoryDto {
  @ApiProperty({ required: false, description: 'Filter by search type' })
  @IsOptional()
  @IsString()
  type?: string;
}
