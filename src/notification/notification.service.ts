import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { NotificationTemplates } from './notification.config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationGateway
  ) {}

  async createAndSend({ type, senderId, recipientId, data }: { type: string; senderId: string; recipientId: string; data: Record<string, any> }) {
    if (senderId === recipientId) return;

    const template = NotificationTemplates[type];
    if (!template) throw new Error(`Unknown notification type: ${type}`);

    const message = template.getMessage(data);

    const notification = await this.prisma.notification.create({
      data: {
        type,
        senderId,
        recipientId,
        message,
        ...(data.postId && { postId: data.postId }),
        ...(data.commentId && { commentId: data.commentId }),
      },
    });

    this.gateway.sendToUser(recipientId, {
      id: notification.id,
      message,
      type,
      ...data,
    });
  }
}
