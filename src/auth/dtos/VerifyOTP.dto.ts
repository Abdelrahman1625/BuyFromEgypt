import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ description: 'Email or phone number of the user' })
  @IsNotEmpty({ message: 'Identifier is required' })
  @IsString()
  identifier: string;

  @ApiProperty({ description: 'OTP code sent to the user' })
  @IsNotEmpty({ message: 'OTP code is required' })
  @IsString()
  otpCode: string;
}
