import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, Matches, MinLength, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TypeEnum } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'Username', description: 'Full name of the user' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({ example: 'aaa@example.com', description: 'Email address of the user' })
  @IsEmail({}, { message: 'Invalid email format' })
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
  phoneNumber: string;

  @ApiProperty({ enum: TypeEnum, example: TypeEnum.IMPORTER, description: 'Type of the user (IMPORTER or EXPORTER)' })
  @IsNotEmpty({ message: 'Type is required' })
  @IsEnum(TypeEnum, { message: 'Type must be either IMPORTER or EXPORTER' })
  type: TypeEnum;

  @ApiProperty({ example: '123456789', description: 'Tax ID for business verification' })
  @IsNotEmpty({ message: 'Tax ID is required for business verification' })
  taxId: string;

  @ApiProperty({ example: 'REG123456', description: 'Registration number of the business' })
  @IsNotEmpty({ message: 'Registration Number is required' })
  registrationNumber: string;

  @ApiProperty({ example: 'Agriculture', description: 'Industrial sector of the business' })
  @IsNotEmpty({ message: 'Industrial Sector is required' })
  industrySector: string;

  @ApiProperty({ example: 'CL123456', description: 'Commercial license for legal verification' })
  @IsNotEmpty({ message: 'Commercial License is required for legal verification' })
  commercial: string;

  @ApiPropertyOptional({ example: '12345678901234', description: 'National ID for exporters' })
  @ValidateIf((obj) => obj.type === TypeEnum.EXPORTER)
  @IsNotEmpty({ message: 'National ID is required for exporters' })
  nationalId: string;

  @ApiPropertyOptional({ example: 'Egypt', description: 'Country for importers' })
  @IsNotEmpty({ message: 'Country is required for importers' })
  country: string;

  @ApiProperty({ example: '123 Main St, Cairo, Egypt', description: 'Address of the user' })
  @IsNotEmpty({ message: 'Address is required' })
  address: string;
}
