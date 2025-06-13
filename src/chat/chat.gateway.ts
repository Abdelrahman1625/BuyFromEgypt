import { WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateMessageStatusDto } from './dto/update-message-status.dto';
import { Logger, Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: { origin: '*', methods: ['GET', 'POST', 'PATCH'] },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;
  private logger = new Logger('ChatGateway');
  private userSocketMap = new Map<string, string[]>();

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    this.server = server;
    this.logger.log('Chat WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) {
      client.disconnect();
      return;
    }

    client.join(userId);

    const userSockets = this.userSocketMap.get(userId) || [];
    userSockets.push(client.id);
    this.userSocketMap.set(userId, userSockets);

    if (userSockets.length === 1) {
      await this.chatService.updateUserOnlineStatus(userId, true);
      this.broadcastUserStatus(userId, true);
    }

    this.logger.log(`User connected: ${userId}, socket: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (!userId) return;

    const userSockets = this.userSocketMap.get(userId) || [];
    const updatedSockets = userSockets.filter((socketId) => socketId !== client.id);

    if (updatedSockets.length === 0) {
      this.userSocketMap.delete(userId);
      await this.chatService.updateUserOnlineStatus(userId, false);
      this.broadcastUserStatus(userId, false);
    } else {
      this.userSocketMap.set(userId, updatedSockets);
    }

    this.logger.log(`User disconnected: ${userId}, socket: ${client.id}`);
  }

  private broadcastUserStatus(userId: string, isOnline: boolean) {
    this.server.emit('userStatusChanged', { userId, isOnline });
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(@ConnectedSocket() client: Socket, @MessageBody() payload: { conversationId: string }) {
    client.join(payload.conversationId);
    this.logger.log(`User joined Group: ${payload.conversationId}`);
    return { success: true };
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(@ConnectedSocket() client: Socket, @MessageBody() payload: { conversationId: string }) {
    client.leave(payload.conversationId);
    this.logger.log(`User left Group: ${payload.conversationId}`);
    return { success: true };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: SendMessageDto) {
    try {
      const message = await this.chatService.createMessage(payload);

      client.emit('messageSent', {
        messageId: message.messageId,
        conversationId: message.conversationId,
        timestamp: message.createdAt,
      });

      const receiverSockets = this.userSocketMap.get(payload.receiverId) || [];
      const isReceiverOnline = receiverSockets.length > 0;

      if (isReceiverOnline) {
        this.server.to(payload.receiverId).emit('receiveMessage', message);

        const isPrivate = await this.chatService.isConversationPrivate(message.conversationId);
        if (!isPrivate) {
          this.server.to(message.conversationId).emit('receiveMessage', message);
        }

        const updatePayload: UpdateMessageStatusDto = {
          messageId: message.messageId,
          status: 'delivered',
        };

        await this.chatService.updateMessageStatus(updatePayload);

        client.emit('messageStatusUpdated', {
          messageId: message.messageId,
          status: 'delivered',
          conversationId: message.conversationId,
        });
      }

      return { success: true, messageId: message.messageId };
    } catch (error) {
      this.logger.error(`Error sending message: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('updateMessageStatus')
  async handleUpdateMessageStatus(@ConnectedSocket() client: Socket, @MessageBody() payload: UpdateMessageStatusDto) {
    const updated = await this.chatService.updateMessageStatus(payload);

    this.server.to(updated.senderId).emit('messageStatusUpdated', {
      messageId: updated.messageId,
      status: payload.status,
      receiverId: updated.receiverId,
    });

    return { success: true };
  }

  @SubscribeMessage('markConversationAsRead')
  async handleMarkConversationAsRead(@ConnectedSocket() client: Socket, @MessageBody() payload: { conversationId: string; userId: string }) {
    await this.chatService.markAllMessagesAsRead(payload.conversationId, payload.userId);

    const unreadMessages = await this.chatService.getUnreadMessageSenders(payload.conversationId, payload.userId);
    const senderIds = [...new Set(unreadMessages.map((msg) => msg.senderId))];

    senderIds.forEach((senderId) => {
      this.server.to(senderId).emit('conversationRead', {
        conversationId: payload.conversationId,
        byUserId: payload.userId,
      });
    });

    return { success: true };
  }

  @SubscribeMessage('renameConversation')
  async handleRenameConversation(@ConnectedSocket() client: Socket, @MessageBody() payload: { conversationId: string; name: string }) {
    const updated = await this.chatService.renameConversation(payload.conversationId, payload.name);

    this.server.to(payload.conversationId).emit('conversationRenamed', {
      conversationId: payload.conversationId,
      name: payload.name,
    });

    return { success: true, conversation: updated };
  }
}
