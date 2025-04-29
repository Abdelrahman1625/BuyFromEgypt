import { IsUUID, IsEnum } from 'class-validator';

export class UpdateMessageStatusDto {
  @IsUUID()
  messageId: string;

  @IsEnum(['seen', 'delivered'])
  status: 'seen' | 'delivered';
}
