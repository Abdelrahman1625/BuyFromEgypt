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

  @IsOptional()
  @IsUUID('all', { each: true })
  @ArrayMinSize(3)
  groupParticipantIds?: string[];

  @IsOptional()
  @IsString()
  groupName?: string;
}
