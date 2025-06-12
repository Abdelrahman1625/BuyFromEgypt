export class CreateNotificationDto {
  type: string;
  senderId: string;
  recipientId: string;
  data: Record<string, any>;
}
