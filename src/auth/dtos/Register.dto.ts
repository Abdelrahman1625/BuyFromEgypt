import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, Matches, MinLength, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TypeEnum } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'Username', description: 'Full name of the user' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({ example: 'aaa@example.com', description: 'Email address of the user' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'password/123', description: 'Password for the user account' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*$/, {
    message: 'Password must contain at least one special character',
  })
  password: string;

  @ApiProperty({ example: '+201234567890', description: 'Phone number of the user' })
  @IsPhoneNumber(undefined, { message: 'Invalid phone number format' })
  @IsNotEmpty({ message: 'Phone number is required' })
  phoneNumber: string;

  @ApiProperty({ enum: TypeEnum, example: TypeEnum.IMPORTER, description: 'Type of the user (IMPORTER or EXPORTER)' })
  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum(TypeEnum, { message: 'Type must be either IMPORTER or EXPORTER' })
  type: TypeEnum;

  @ApiProperty({ example: '123456789', description: 'Tax ID for business verification' })
  @IsNotEmpty({ message: 'Tax ID is required' })
  taxId: string;

  @ApiProperty({ example: '12345678901234', description: 'National ID' })
  @IsNotEmpty({ message: 'National ID is required' })
  nationalId: string;

  @ApiProperty({ example: 'Egypt', description: 'Country' })
  @IsNotEmpty({ message: 'Country is required' })
  country: string;

  @ApiProperty({ example: 25, description: 'Age of the user' })
  @IsNumber()
  @Min(18, { message: 'Age must be at least 18' })
  @IsNotEmpty({ message: 'Age is required' })
  age: number;

  @ApiPropertyOptional({ example: 'REG123456', description: 'Registration number of the business' })
  @IsOptional()
  registrationNumber?: string;

  @ApiPropertyOptional({ example: 'Agriculture', description: 'Industrial sector of the business' })
  @IsOptional()
  industrySector?: string;

  @ApiPropertyOptional({ example: 'CL123456', description: 'Commercial license for legal verification' })
  @IsOptional()
  commercial?: string;

  @ApiPropertyOptional({ example: '123 Main St, Cairo, Egypt', description: 'Address of the user' })
  @IsOptional()
  address?: string;
}
