import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateMailDto {
  @IsEmail()
  to: string;

  @IsString({message: 'From address must be a string'})
  subject: string;

  @IsOptional({message: 'Text content is optional'})
  @IsString({message: 'Text content must be a string'})
  text?: string;

  @IsOptional({message: 'HTML content is optional'})
  @IsString({message: 'HTML content must be a string'})
  html?: string;
}
