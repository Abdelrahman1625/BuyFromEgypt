import { IsString, IsNotEmpty, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { MessageType } from '@prisma/client';

export class SendMessageDto {
  @IsUUID()
  senderId: string;

  @IsUUID()
  @IsOptional()
  receiverId?: string;

  @IsUUID()
  @IsOptional()
  conversationId?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(MessageType)
  messageType: MessageType;
}
