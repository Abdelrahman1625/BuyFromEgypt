import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestResetDto {
  @ApiProperty({ description: 'Email or phone number of the user' })
  @IsNotEmpty({ message: 'Identifier is required' })
  @IsString()
  identifier: string;
}
