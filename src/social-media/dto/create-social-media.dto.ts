import { IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSocialMediaDto {
  @ApiProperty({ description: 'Social media platform name' })
  @IsString()
  platform: string;

  @ApiProperty({ description: 'Social media profile URL', required: false })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiProperty({ description: 'Social media handle/username', required: false })
  @IsOptional()
  @IsString()
  handle?: string;
}
