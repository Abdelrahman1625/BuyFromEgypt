import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: '/notification', cors: true })

export class NotificationGateway implements OnGatewayConnection, OnGatewayInit {
  @WebSocketServer()
  server: Server;
  private logger = new Logger('NotificationGateway');

  afterInit(server: Server) {
    this.server = server;
    this.logger.log('Notification WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) client.join(userId);
  }

  sendToUser(userId: string, payload: any) {
    this.server.to(userId).emit('notification', payload);
  }
}
