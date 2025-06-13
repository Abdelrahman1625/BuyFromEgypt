import { IsOptional, IsString, IsUrl, Matches } from 'class-validator';

export class CreateSocialMediaDto {
  @IsOptional()
  @IsString()
  @IsUrl()
  instagram?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  facebook?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Invalid WhatsApp number format',
  })
  whatsappNumber?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  tiktok?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  xUrl?: string;

  @IsOptional()
  @IsString()
  instagramHandle?: string;

  @IsOptional()
  @IsString()
  facebookHandle?: string;

  @IsOptional()
  @IsString()
  tiktokHandle?: string;

  @IsOptional()
  @IsString()
  xHandle?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
