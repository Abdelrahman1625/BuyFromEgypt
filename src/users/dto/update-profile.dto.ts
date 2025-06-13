import { IsOptional, IsString, IsNumber, Min, IsPhoneNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Full name of the user' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com', description: 'Email address of the user' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '+201234567890', description: 'Phone number of the user' })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number format' })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'Egypt', description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 25, description: 'Age of the user' })
  @IsOptional()
  @IsNumber()
  @Min(18, { message: 'Age must be at least 18' })
  age?: number;

  @ApiPropertyOptional({ example: 'REG123456', description: 'Registration number of the business' })
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiPropertyOptional({ example: 'Agriculture', description: 'Industrial sector of the business' })
  @IsOptional()
  @IsString()
  industrySector?: string;

  @ApiPropertyOptional({ example: 'CL123456', description: 'Commercial license for legal verification' })
  @IsOptional()
  @IsString()
  commercial?: string;

  @ApiPropertyOptional({ example: '123 Main St, Cairo, Egypt', description: 'Address of the user' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'A brief description about the user', description: 'About section of the user profile' })
  @IsOptional()
  @IsString()
  about?: string;
}
