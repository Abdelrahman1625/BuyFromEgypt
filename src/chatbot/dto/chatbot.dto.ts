import { IsString, IsOptional, IsIn, IsObject, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BusinessContextDto {
  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;
}

export class ChatMessageDto {
  @IsString()
  @MaxLength(500, { message: 'Message cannot exceed 500 characters.' })
  message: string;

  @IsOptional()
  @IsString()
  session_id?: string | null;

  @IsOptional()
  @IsString()
  @IsIn(['buyer', 'seller'], { message: 'User type must be either "buyer" or "seller".' })
  user_type?: 'buyer' | 'seller';

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BusinessContextDto)
  business_context?: BusinessContextDto | null;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  sources?: string[];
  processing_time?: number;
}
