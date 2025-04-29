import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageStatusDto } from './dto/update-message-status.dto';
import { ConversationType } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createConversation(participantIds: string[], name?: string) {
    if (participantIds.length < 3) {
      throw new BadRequestException('Group must have at least 3 participants');
    }

    const users = await this.prisma.user.findMany({
      where: { userId: { in: participantIds } },
      select: { userId: true },
    });
    const existingUserIds = users.map((user) => user.userId);
    const invalidUserIds = participantIds.filter((id) => !existingUserIds.includes(id));

    if (invalidUserIds.length > 0) {
      throw new BadRequestException(`Invalid user IDs: ${invalidUserIds.join(', ')}`);
    }

    const conversation = await this.prisma.conversation.create({
      data: {
        name: name || undefined,
        type: ConversationType.GROUP,
        participants: { create: participantIds.map((userId) => ({ userId })) },
      },
      include: { participants: true },
    });
    return {
      conversationId: conversation.id,
      name: conversation.name,
      participants: conversation.participants.map((p) => p.userId),
    };
  }

  async getOrCreatePrivateConversation(userId1: string, userId2: string) {
    const users = await this.prisma.user.findMany({
      where: { userId: { in: [userId1, userId2] } },
      select: { userId: true },
    });
    const existingUserIds = users.map((user) => user.userId);
    const invalidUserIds = [userId1, userId2].filter((id) => !existingUserIds.includes(id));

    if (invalidUserIds.length > 0) {
      throw new BadRequestException(`Invalid user IDs: ${invalidUserIds.join(', ')}`);
    }

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        type: ConversationType.PRIVATE,
        participants: {
          every: {
            userId: { in: [userId1, userId2] },
          },
        },
        AND: [{ participants: { some: { userId: userId1 } } }, { participants: { some: { userId: userId2 } } }],
      },
      include: { participants: true },
    });

    if (conversation) {
      return conversation;
    }

    const newConversation = await this.prisma.conversation.create({
      data: {
        type: ConversationType.PRIVATE,
        participants: {
          create: [{ userId: userId1 }, { userId: userId2 }],
        },
      },
      include: { participants: true },
    });

    return newConversation;
  }

  async createGroupConversation(userIds: string[], name?: string) {
    const newConversation = await this.prisma.conversation.create({
      data: {
        name: name || undefined,
        type: ConversationType.GROUP,
        participants: { create: userIds.map((userId) => ({ userId })) },
      },
      include: { participants: true },
    });

    return newConversation;
  }

  async createMessage(data: SendMessageDto) {
    const userIdsToValidate = [data.senderId];
    if (data.receiverId) userIdsToValidate.push(data.receiverId);
    if (Array.isArray(data.groupParticipantIds)) {
      userIdsToValidate.push(...data.groupParticipantIds);
    }

    const users = await this.prisma.user.findMany({
      where: { userId: { in: userIdsToValidate } },
      select: { userId: true },
    });
    const existingUserIds = users.map((user) => user.userId);
    const invalidUserIds = userIdsToValidate.filter((id) => !existingUserIds.includes(id));

    if (invalidUserIds.length > 0) {
      throw new BadRequestException(`Invalid user IDs: ${invalidUserIds.join(', ')}`);
    }

    let conversation: { id: string; participants: any[]; name: string | null; type: ConversationType; createdAt: Date; updatedAt: Date } | null = null;

    if (Array.isArray(data.groupParticipantIds) && data.groupParticipantIds.length > 2) {
      if (!data.groupParticipantIds.includes(data.senderId)) {
        data.groupParticipantIds.push(data.senderId);
      }

      conversation = await this.createGroupConversation(data.groupParticipantIds, data.groupName);
    } else {
      conversation = await this.getOrCreatePrivateConversation(data.senderId, data.receiverId);
    }

    const message = await this.prisma.message.create({
      data: {
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        messageType: data.messageType,
        conversationId: conversation.id,
      },
      include: {
        sender: { select: { userId: true, name: true } },
        receiver: { select: { userId: true, name: true } },
        conversation: true,
      },
    });

    return message;
  }

  async getConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                userId: true,
                name: true,
                profileImage: true,
                isOnline: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { userId: true, name: true } },
          },
        },
      },
      orderBy: {
        messages: {
          _count: 'desc',
        },
      },
    });

    return conversations;
  }

  async getMessagesByConversation(conversationId: string) {
    const messages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { userId: true, name: true, profileImage: true } },
        receiver: { select: { userId: true, name: true, profileImage: true } },
      },
    });

    return messages;
  }

  async getMessagesBetweenUsers(senderId: string, receiverId: string) {
    const conversation = await this.getOrCreatePrivateConversation(senderId, receiverId);

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId: conversation.id,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { userId: true, name: true, profileImage: true } },
        receiver: { select: { userId: true, name: true, profileImage: true } },
      },
    });

    return messages;
  }

  async updateMessageStatus(data: UpdateMessageStatusDto) {
    const updateData: any = {};
    if (data.status === 'seen') {
      updateData.seen = true;
      updateData.delivered = true;
    } else {
      updateData.delivered = true;
    }
    return this.prisma.message.update({
      where: { messageId: data.messageId },
      data: updateData,
      include: {
        sender: { select: { userId: true, name: true } },
        receiver: { select: { userId: true, name: true } },
      },
    });
  }

  async markAllMessagesAsRead(conversationId: string, userId: string) {
    return this.prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: userId,
        seen: false,
      },
      data: {
        seen: true,
        delivered: true,
      },
    });
  }

  async getUnreadMessageSenders(conversationId: string, receiverId: string) {
    return this.prisma.message.findMany({
      where: {
        conversationId,
        receiverId,
        seen: false,
      },
      select: {
        messageId: true,
        senderId: true,
      },
    });
  }

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { userId },
      select: { userId: true, isOnline: true, name: true, profileImage: true },
    });
  }

  async updateUserOnlineStatus(userId: string, isOnline: boolean) {
    return this.prisma.user.update({
      where: { userId },
      data: { isOnline },
    });
  }

  async renameConversation(conversationId: string, name: string) {
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { name },
      include: { participants: true },
    });
  }

  async isConversationPrivate(conversationId: string): Promise<boolean> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { type: true },
    });

    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }

    return conversation.type === 'PRIVATE';
  }
}
