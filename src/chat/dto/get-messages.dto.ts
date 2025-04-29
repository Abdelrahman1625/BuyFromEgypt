import { IsUUID, IsOptional } from 'class-validator';

export class GetMessagesDto {
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsOptional()
  @IsUUID()
  senderId?: string;

  @IsOptional()
  @IsUUID()
  receiverId?: string;
}
