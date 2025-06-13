import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { ExpressAdapter } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { INestApplication } from '@nestjs/common';

const server = express();
const httpServer = createServer(server);
let app: INestApplication;
let io: SocketIOServer;

if (process.env.NODE_ENV !== 'production') {
  io = new SocketIOServer(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST', 'PATCH'] },
    path: '/socket.io',
  });
}

async function bootstrap(): Promise<express.Express> {
  if (!app) {
    const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(server));

    nestApp.enableCors();
    setupSwagger(nestApp);

    if (io && process.env.NODE_ENV !== 'production') {
      const { ChatGateway } = await import('./chat/chat.gateway');
      const { NotificationGateway } = await import('./notification/notification.gateway');

      const chatGateway = nestApp.get(ChatGateway);
      const notificationGateway = nestApp.get(NotificationGateway);

      chatGateway.afterInit(io);
      notificationGateway.afterInit(io);

      const chatNamespace = io.of('/chat');
      const notificationNamespace = io.of('/notification');

      chatNamespace.on('connection', (socket) => {
        chatGateway.handleConnection(socket);
        socket.on('disconnect', () => chatGateway.handleDisconnect(socket));
      });

      notificationNamespace.on('connection', (socket) => {
        notificationGateway.handleConnection(socket);
      });
    }

    await nestApp.init();
    app = nestApp;
  }
  return server;
}

if (process.env.NODE_ENV !== 'production') {
  bootstrap().then(() => {
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`📄 Swagger Docs available at: http://localhost:${PORT}/api-docs`);
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await bootstrap();
  return server(req, res);
}
