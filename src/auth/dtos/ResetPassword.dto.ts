import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from '../validators/match.decorator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'The reset token' })
  @IsNotEmpty({ message: 'Reset token is required' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'The new password' })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
    message: 'Password must contain at least one letter, one number, and one special character',
  })
  newPassword: string;

  @ApiProperty({ description: 'Confirm the new password' })
  @IsNotEmpty({ message: 'Confirm password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/, {
    message: 'Password must contain at least one letter, one number, and one special character',
  })
  @Match('newPassword', { message: 'Passwords do not match' })
  confirmPassword: string;

  @ApiProperty({ description: 'User identifier (email or phone number)', required: false })
  @IsString()
  identifier?: string;
}
