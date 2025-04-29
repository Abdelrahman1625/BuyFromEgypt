import { MessageType } from '@prisma/client';

export class MessageEntity {
  messageId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: MessageType;
  seen?: boolean;
  delivered?: boolean;
  createdAt: Date;
  updatedAt?: Date;

  sender?: {
    userId: string;
    name: string;
  };

  receiver?: {
    userId: string;
    name: string;
  };
}
