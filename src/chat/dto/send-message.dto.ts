import { IsString, IsNotEmpty, IsUUID, IsEnum, IsOptional, ArrayMinSize } from 'class-validator';
import { MessageType } from '@prisma/client';

export class SendMessageDto {
  @IsUUID()
  senderId: string;

  @IsUUID()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(MessageType)
  messageType: MessageType;
}
